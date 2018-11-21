npm commands
=========================
* In production environment, start server
```
    npm run start
```
* or stop server
```
    npm run stop
```
* or restart sever
```
    npm run restart
```
* In development environment, via port 9528
```
    npm run dev
```
* setup miniconda
```
    npm run setup
```


Start the Node sever by forever
=========================
* start the node server
```bash
    forever start /var/bivServer/bin/www
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

