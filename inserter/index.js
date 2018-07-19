const {MongoClient} = require("mongodb");

async function main() {
    const client = await MongoClient("mongodb://localhost:27017,localhost:27018");
}

main()