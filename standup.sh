#!/bin/bash

pushd .

docker-compose -f mongo-sharded/replica.yml stop
docker-compose -f mongo-sharded/replica.yml rm -f

docker-compose -f mongo-sharded/replica.yml up --no-start
docker-compose -f mongo-sharded/replica.yml start

cd manager &&
node ./index.js &&
cd ../ &&
./status.sh &&
echo "Press any key to exit" &&
read -n 1

popd
docker-compose -f mongo-sharded/replica.yml stop
docker-compose -f mongo-sharded/replica.yml rm -f
echo "Exiting"
