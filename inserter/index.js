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

    const configCollection = client
        .db("config")
        .collection("chunks");

    const ids = await Promise.all(_.map(_.range(1000), async (value) => {
        const ins = await collection.insertOne({
            "text": "Hello World",
            "count": value,
            "bloat": text
        });
        return ins.insertedId;
    }));

    async function unballanced() {
        const allChunks = await configCollection.find({}).toArray();
        const associated = _.chain(allChunks)
            .map(p => p.shard)
            .groupBy()
            .mapValues(p => p.length);
        const one = associated["mongors1"];
        const two = associated["mongors2"];

        if (!one || !two) {
            return false;
        }

        return (max(one, two) * 0.8 < min(one, two));
    }
    while (await unballanced()) {
        sleep(1000);
    }

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