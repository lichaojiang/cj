# 下载miniconda
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-x86_64.sh

# 找到本脚本路径
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 1. 直接enter
# 2. 输入yes，license
# 3. enter 
# 4. 输入yes，注册miniconda路径

# 安装miniconda，安装路径为/opt/miniconda3
sudo bash "${SCRIPT_DIR}/Miniconda3-latest-MacOSX-x86_64.sh"

source ~/.bash_profile

source setup_conda_mac.sh

rm -r "${SCRIPT_DIR}/Miniconda3-latest-*"