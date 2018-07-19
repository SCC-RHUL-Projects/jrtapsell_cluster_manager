const LOG_DIR = "/home/james/tmp/logs/files";

const fs = require("fs");
const {promisify} = require("util");
const _ = require("lodash");

const ls = promisify(fs.readdir);
const read = (p) => promisify(fs.readFile)(p).then(q => q.toString());

async function main() {
    const servers = _.chain(await ls(LOG_DIR))
        .filter(fileName => fileName.endsWith(".prov"))
        .map(serverName => serverName.substr(0, serverName.length - 5))
        .value();

    const rawData = await Promise.all(_.map(servers, serverName => read(`${LOG_DIR}/${serverName}.prov`)));
    const lines = rawData.map(allText => allText.split("\n").filter(line => line !== "").map(line => {
        return JSON.parse(line)
    }));
    const serverInfos = _.chain(lines)
        .map(serverLines => {
            return _.chain(serverLines)
                .map(line => {
                    const {commandName, event} = line;
                    if (line.event === "logCommandAuthzCheck") {
                        return "C_" + commandName;
                    } else {
                        return event;
                    }
                })
                .uniqBy()
                .value();
        })
        .value();
    const orderedEventTypes = _.chain(Object.values(serverInfos))
        .flatMap()
        .uniqBy()
        .value();
    
    const header = _.chain(orderedEventTypes)
        .map(p => "," + p)
        .join("")
        .value();

    const body = _.chain(servers)
        .map(serverName => serverName + orderedEventTypes.map(state => {
            const serverIndex = servers.indexOf(serverName);
            if (serverInfos[serverIndex].indexOf(state) !== -1) {
                return `,X`;
            } else {
                return `,`;
            }
        }).join(""))
        .join("\n")
        .value();

    fs.writeFileSync("out.csv", header + "\n" + body);
}

main()
    .then(() => console.log("Complete"));