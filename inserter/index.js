const {MongoClient} = require("mongodb");

async function main() {
    const client = await MongoClient("mongodb://localhost:27017,localhost:27018");
    const collection = client
        .db("testDb")
        .collection("chunks");
    const ins = await collection.insert({
        "Hello": "World"
    })
}

main();