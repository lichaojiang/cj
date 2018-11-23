#!/bin/bash
cwd=$(pwd)

# 找到本脚本路径
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=$(cd "${SCRIPT_DIR}/.." && pwd)

conda_link=""
conda_sh=""

isDarwin="$(uname -a | grep 'Darwin')"
isLinux="$(uname -a | grep 'Linux')"

if [ ! -z "$isDarwin" ];then
    conda_link="https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-x86_64.sh"
    conda_sh="Miniconda3-latest-MacOSX-x86_64.sh"
elif [ ! -z "$isLinux" ];then
    conda_link="https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh"
    conda_sh="Miniconda3-latest-Linux-x86_64.sh"
fi

# 安装miniconda
isConda="$(which conda | grep 'conda')"
if [ -z "$isConda" ];then
    cd $SCRIPT_DIR
    # 下载miniconda
    wget $conda_link
    # 安装conda
    # 1. 直接enter
    # 2. 输入yes，license
    # 3. enter 
    # 4. 输入yes，注册miniconda路径
    sudo bash "${SCRIPT_DIR}/${conda_sh}"
    # 删除安装文件
    rm "${SCRIPT_DIR}/${conda_sh}"
else
    echo "Conda is already installed."
fi

# source to enable conda PATH
if [ ! -z "$isDarwin" ];then
    source ~/.bash_profile
elif [ ! -z "$isLinux" ];then
    source ~/.bashrc
fi

# 安装虚拟环境
# bivstats
bivstats_env=$(conda info --env | grep "${ROOT_DIR}/envs/bivstats")
echo $bivstats_env
if [ ! -z "$bivstats_env" ];then
    conda remove --prefix "${ROOT_DIR}/envs/bivstats" --all --yes --force
fi

# create environment
if [ ! -z "$isDarwin" ];then
    conda env create --prefix "${ROOT_DIR}/envs/bivstats" --file "${ROOT_DIR}/EXE/Analysiscore_mac/stats_env.yml"
elif [ ! -z "$isLinux" ];then
    conda env create --prefix "${ROOT_DIR}/envs/bivstats" --file "${ROOT_DIR}/EXE/Analysiscore_linux/stats_env.yml"
fi


cd $cwd

path=$(conda info --env | grep bivstats)