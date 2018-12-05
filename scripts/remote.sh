#!/bin/bash
if [ "$1" == "start" ];then
    echo -n "Remote server user name:"
    read user
    ssh "${user}@admin.bivrost.cn" "cd /var/bivServer/ && git reset origin master && npm install && npm run start"
elif [ "$1" == "stop" ];then
    echo -n "Remote server user name:"
    read user
    ssh "${user}@admin.bivrost.cn" "cd /var/bivServer/ && git reset origin master && npm install && npm run stop"
elif [ "$1" == "restart" ];then
    echo -n "Remote server user name:"
    read user
    ssh "${user}@admin.bivrost.cn" "cd /var/bivServer/ && git reset origin master && npm install && npm run restart"
elif [ "$1" == "setup" ];then
    echo -n "Remote server user name:"
    read user
    ssh "${user}@admin.bivrost.cn" "cd /var/bivServer/ && git reset origin master && npm install && npm run setup"
fi