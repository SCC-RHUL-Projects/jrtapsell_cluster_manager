#!/bin/bash

pushd .

cd mongo-sharded

docker-compose stop
docker-compose rm -fv

./cleanLogs.sh

docker-compose up --no-start
docker-compose start
cd ../
cd manager
node ./index.js
cd ../inserter/
node ./index.js
cd ../
# ./status.sh &&
# echo "Press any key to exit"
# read -n 1

popd
docker-compose -f mongo-sharded/docker-compose.yml stop
docker-compose -f mongo-sharded/docker-compose.yml rm -fv
echo "Exiting"