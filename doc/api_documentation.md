# analysis
1. line
    * url
        ```
        www.bivrost.cn/analysis
        ```
    * params
        ```
        method=line
        start=2018-7-13+08:00:00
        end=2018-7-13+08:00:00
        type=pace
        machine=1
        ```
    
2. any
    * url
        ```
        www.bivrost.cn/analysis
        ```
    * params
        ```
        method=any
        ```
    * body
        ```json
        {
            "machine": "1",
            "interval_start":["2018-07-14 8:00:00", "2018-07-14 13:30:00"],
            "interval_end":["2018-07-14 12:00:00", "2018-07-14 17:30:00"],
            "days": 5,
            "title": "Efficiency",
            "xlabel": "Date",
            "ylabel": "Eff",
            "alias":["morning","afternoon"],
            "variables":"'throughput,elasped,setup,poweroff'",
            "recipe":"'throughput/(elasped-setup-poweroff)'",
            "getdata":["2018-07-14 00:00:00", "2018-08-30 00:00:00", "cycle"]
        }
        ```
    
    * getdata is optional

# getStats
* url
    ```
    www.bivrost.cn/datatable
    ```
* params
    ```
    method=getDatatable
    start=2018-07-10+08:00:00
    end=2018-07-14+08:00:00
    type=pace
    machine=1
    ```
