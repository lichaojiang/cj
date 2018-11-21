#!/bin/bash
if [ "$2" == "start" ];then
    echo -n "Remote server user name:"
    read user
    ssh "${user}@admin.bivrost.cn" "cd /var/bivServer/ && git pull && npm install && npm run setup && npm run start"
elif [ "$2" == "stop" ];then
    echo -n "Remote server user name:"
    read user
    ssh "${user}@admin.bivrost.cn" "cd /var/bivServer/ && git pull && npm install && npm run setup && npm run stop"
elif [ "$2" == "restart" ];then
    echo -n "Remote server user name:"
    read user
    ssh "${user}@admin.bivrost.cn" "cd /var/bivServer/ && git pull && npm install && npm run setup && npm run restart"
fi