# 下载miniconda
wget https://repo.continuum.io/miniconda/Miniconda3-latest-Linux-x86_64.sh

# 找到本脚本路径
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 1. 直接enter
# 2. 输入yes，license
# 3. enter 
# 4. 输入yes，注册miniconda路径

# 安装miniconda，安装路径为/opt/miniconda3
sudo bash "${SCRIPT_DIR}/Miniconda3-latest-Linux-x86_64.sh"

source ~/.bashrc
# 安装虚拟环境
conda create --prefix "${SCRIPT_DIR}/myapp/envs/bivstats" --file "${SCRIPT_DIR}/myapp/EXE/Analysiscore/stats/stats_env_linux.txt"

rm -r "${SCRIPT_DIR}/Miniconda3-latest-Linux-x86_64.sh"