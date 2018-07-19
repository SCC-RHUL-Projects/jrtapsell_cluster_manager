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

    await Promise.all(_.map(_.range(100), async (value) => {
        const ins = await collection.insert({
            "text": "Hello World",
            "count": value,
            "bloat": text
        });
    }));
    await client.close();
}

main();