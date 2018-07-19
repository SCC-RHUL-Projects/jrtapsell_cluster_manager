const {MongoClient} = require("mongodb");
const _ = require("lodash");
const fs = require("fs");
const {promisify} = require("util");

const readPromise = promisify(fs.readFile);

function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time)
    })
}
async function main() {
    const text = (await readPromise("./lorum.txt")).toString();
    const client = await MongoClient.connect("mongodb://localhost:27017,localhost:27018",{ useNewUrlParser: true });
    const collection = client
        .db("testDb")
        .collection("testCollection");

    const ids = await Promise.all(_.map(_.range(100), async (value) => {
        const ins = await collection.insertOne({
            "text": "Hello World",
            "count": value,
            "bloat": text
        });
        return ins.insertedId;
    }));

    const chunks = client
        .db("config")
        .collection("chunks");

    let counts, high, low;
    do {
        const data = await chunks.find({}).toArray();
        counts = _.chain(data)
            .groupBy(p => p.shard)
            .mapValues(p => p.length)
            .value();

        high = _.maxBy(Object.keys(counts), p => counts[p]);
        low = _.minBy(Object.keys(counts), p => counts[p]);
        await sleep(1000);
    } while (counts[high] * 0.8 > counts[low]);

    await Promise.all(_.map(ids, async (value) => {
        return collection.updateOne(
            {"_id": value},
            {"$set": {"text": "Goodbye"}}
        )
    }));

    await Promise.all(_.map(ids, async (value) => {
        return collection.deleteOne(
            {"_id": value}
        )
    }));

    await client.close();
}

main();