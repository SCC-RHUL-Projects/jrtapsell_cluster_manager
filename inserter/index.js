const {MongoClient} = require("mongodb");
const _ = require("lodash");
const fs = require("fs");
const {promisify} = require("util");

const readPromise = promisify(fs.readFile);

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




    console.log(ids);
    await client.close();
}

main();