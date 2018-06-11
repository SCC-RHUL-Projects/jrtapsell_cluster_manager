#!/bin/bash
docker exec -it mongos1 bash -c "printf use testDb\ndb.testCollection.printShardingStatus()' | mongo "
docker exec -it mongos1 bash -c "printf 'db.printShardingStatus()' | mongo "
docker exec -it mongos1 bash -c "printf 'sh.status()' | mongo "
