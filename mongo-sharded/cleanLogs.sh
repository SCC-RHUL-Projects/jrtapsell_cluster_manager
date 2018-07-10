#!/bin/bash
rm -rf logs
mkdir logs
cd logs
touch mongo_shard1_node1
touch mongo_shard1_node2
touch mongo_shard1_node3

touch mongo_shard2_node1
touch mongo_shard2_node2
touch mongo_shard2_node3

touch mongo_config1
touch mongo_config2
touch mongo_config3

touch mongos1
touch mongos2

chmod 666 ./*
