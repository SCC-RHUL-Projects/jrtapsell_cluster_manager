const LOG_DIR = "/home/james/tmp/logs/files";

const fs = require("fs");
const {promisify} = require("util");
const _ = require("lodash");

const ls = promisify(fs.readdir);
const read = (p) => promisify(fs.readFile)(p).then(q => q.toString());

async function main() {
    const servers = _.chain(await ls(LOG_DIR))
        .filter(p => p.endsWith(".prov"))
        .map(p => p.substr(0, p.length - 5))
        .value();

    const rawData = await Promise.all(_.map(servers, p => read(`${LOG_DIR}/${p}.prov`)));
    const lines = rawData.map(p => p.split("\n").map(q => {
        try {
            return JSON.parse(q)
        } catch (e) {
            console.log(e);
        }
    }));
    console.log(lines)
}

main();