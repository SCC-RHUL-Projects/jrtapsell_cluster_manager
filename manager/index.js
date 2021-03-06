const Docker = require("dockerode");
const docker = new Docker({socketPath: "/var/run/docker.sock"});
const _ = require("lodash");
const chalk = require("chalk");

const projectName = "mongo-sharded";

const commands = [
    {
        server:"mongo_config1",
        command: `rs.initiate({_id: "mongors1conf",configsvr: true, members: [{ _id : 0, host : "mongo_config1:27017" },{ _id : 1, host : "mongo_config2:27017" }, { _id : 2, host : "mongo_config3:27017" }]})`},
    {
        server:"mongo_shard1_node1",
        command: `rs.initiate({_id : "mongors1", members: [{ _id : 0, host : "mongo_shard1_node1:27017" },{ _id : 1, host : "mongo_shard1_node2:27017" },{ _id : 2, host : "mongo_shard1_node3:27017" }]})`},

    {
        server:"mongo_shard2_node1",
        command: `rs.initiate({_id : "mongors2", members: [{ _id : 0, host : "mongo_shard2_node1:27017" },{ _id : 1, host : "mongo_shard2_node2:27017" },{ _id : 2, host : "mongo_shard2_node3:27017" }]})`},

    {
        server:"mongos1",
        command: `sh.addShard("mongors1/mongo_shard1_node1")`},
    {
        server:"mongos1",
        command: `sh.addShard("mongors2/mongo_shard2_node1")`},

    {
        server:"mongos1",
        command: `sh.enableSharding("testDb")`,
        needsAuth: true
    },
    {
        server:"mongos1",
        command: `use config\ndb.settings.save( { _id:"chunksize", value: 1 } )`,
        needsAuth: true
    },
    {
        server:"mongo_shard1_node1",
        command: `db.createCollection("testDb.testCollection")`,
        needsAuth: true
    },
    {
        server:"mongos1",
        command: `sh.shardCollection("testDb.testCollection", {"_id" : 1})`,
        needsAuth: true
    }
];

const execArgs = {Cmd: ["mongo"], AttachStdin: true, AttachStdout: true, AttachStderr: true};
const startArgs = {hijack: true, stdin: true, stdout:true, stderr:true};

function sleep(time=1000) {
    return new Promise((resolve) =>
        setTimeout(resolve, time)
    )
}
const createdAccounts = {};

async function runCommand(containerIds, index, attemptNumber) {
    process.stdout.write(`Trying command number: ${(index+1).toString().padStart(Math.log10(commands.length) + 1)}/${commands.length} (attempt ${attemptNumber}) ... `);
    const command = commands[index];

    const containerId = containerIds[command.server];
    if (containerId === null) {
        throw Error(`Unknown container for ${JSON.stringify(command.server)}`)
    }
    const container = docker.getContainer(containerId);
    const exec = await container.exec(execArgs).then((exec) => Promise.all(
        [
            Promise.resolve(exec),
            new Promise(((resolve, reject) => exec.start(startArgs, (_,q) => resolve(q))))
        ]))
        .then((args) => {
            stream = args[1];
            if (command.needsAuth) {
                if (!createdAccounts[command.server]) {
                    stream.write("db.getSiblingDB(\"admin\").createUser({user:\"admin\",pwd:\"password\",roles:[{role:\"root\",db: \"admin\"}]})");
                    stream.write("\n");
                    createdAccounts[command.server] = true;
                }
                stream.write("db.getSiblingDB(\"admin\").auth(\"admin\", \"password\" )");
                stream.write("\n");
            }
            stream.write(command.command);
            stream.write("\n");
            stream.write("exit\n");
            //docker.modem.demuxStream(stream, process.stdout, process.stderr);
            return args[0]
        });
    while (true) {
        await sleep();
        const log = await exec.inspect();
        const exitCode = log.ExitCode;
        if (exitCode == null) {
            continue
        }
        if (exitCode === 0) {
            console.log(chalk.green("Success"));
            if (index + 1 in commands) {
                runCommand(containerIds, index + 1, 1)
            } else {
                terminate(containerIds)
            }
        } else {
            console.log(chalk.red("Failed"));
            await sleep(2000);
            if (attemptNumber < 20) {
                runCommand(containerIds, index, attemptNumber + 1)
            } else {
                console.log("Giving up");
                process.exit(1)
            }
        }
        break
    }
}

function restart(containerIds, containerName) {
    return docker.getContainer(containerIds[containerName]).restart();
}

async function terminate(containerIds) {
    await restart(containerIds, "mongo-express-data1");
    await restart(containerIds, "mongo-express-data2");
    //await restart(containerIds, "mongo-express-config");
    await Promise.all(_.map(containerIds, async (id, name) => {
        await new Promise((resolve, reject) => {
            docker.getContainer(id).inspect((err, data) => {
                if (err) {
                    return reject(err);
                }
                console.log(`${name} - ${data.State.Status}`);
                resolve();
            });
        })
    }));
    return null;
}
async function main() {
    const containers = await docker.listContainers({all: true});
    const containerIds = _.chain(containers)
        .filter((p) => p.Labels["com.docker.compose.project"] === projectName)
        .groupBy((p) => p.Labels["com.docker.compose.service"])
        .mapValues((p) => p[0].Id)
        .value();

    //console.log(JSON.stringify(containerIds));
    return await runCommand(containerIds, 0,1)
}

// noinspection JSIgnoredPromiseFromCall
main();
