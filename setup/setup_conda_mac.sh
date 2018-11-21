# 找到本脚本路径
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 安装虚拟环境
# bivstats
conda env create --prefix "${SCRIPT_DIR}/envs/bivstats" --file "${SCRIPT_DIR}/stats_env.yml"