Start the server by script
=========================
* In production environment, start
```
    source server start
```
* or stop
```
    source server stop
```
* or restart
```
    source server restart
```
* In development environment, via port 9528
```
    source server dev
```
* Use install option to initiate node modules when in development environment
```
    source server dev install
```


Start the Node sever by forever
=========================
* start the node server
```bash
    forever start /var/BivBackend/myapp/bin/www
```    
* stop the node server
    * 1. look up PID of running server instance by:
```bash
    forever list
```    
    * 2. remember the PID number looked up by previous step ,and stop this server by:
```bash
    forever stop PID
```    
* Restart the node server
    please first stop the server then start again.


配置miniconda（linux, mac）
=========================
* 运行setupconda.sh

* 按照提示完成安装，提示如下：
    1. 直接enter
    2. 输入yes（答应license）
    3. enter（默认路径）
    4. 输入yes（注册miniconda路径）


