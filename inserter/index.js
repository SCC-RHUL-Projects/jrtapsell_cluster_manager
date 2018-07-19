const {MongoClient} = require("mongodb");

async function main() {
    const client = new MongoClient("mongodb://localhost:27017,localhost:27018");
    await client.open();
    const collection = client
        .db("testDb")
        .collection("chunks");
    const ins = await collection.insert({
        "Hello": "World"
    });
    await client.close();
}

main();