const {MongoClient} = require("mongodb");

async function main() {
    const client = await MongoClient.connect("mongodb://localhost:27017,localhost:27018");
    const collection = client
        .db("testDb")
        .collection("chunks");
    const ins = await collection.insert({
        "Hello": "World"
    });
    await client.close();
}

main();