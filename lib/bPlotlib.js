'use strict'
const bres = require('./bResponse');
const util = require('./bUtils');
const bach = require('./bAnalysiscorestatus');

class plotbase {
    constructor(xlabel, ylabel, title) {
        this.xlabel = xlabel;
        this.ylabel = ylabel;
        this.title = title;
    }

    tojson() {
        return JSON.stringify(this);
    }
}

class line extends plotbase {
    constructor(x, y, xlabel = "", ylabel = "", title = "", color = "blue") {
        if (Array.isArray(x) === false || Array.isArray(y) === false) throw Error('Expect array');
        // length of x and y should be equal
        if (x.length != y.length) throw Error('x.length != y.length');
        super(xlabel, ylabel, title);
        this.x = x;
        this.y = y;
        this.color = color;
        this.graph_type = "line";
    }
}

class hist extends plotbase {
    constructor(x_data, y_data, xlabel = "", ylabel = "", title = "", color = "blue") {
        if (Array.isArray(x_data) === false || Array.isArray(y_data) === false) throw Error('Expect array');
        // length of x and y should be equal
        if (x_data.length != y_data.length) throw Error('x_data.length != y_data.length');
        super(xlabel, ylabel, title);
        this.x_data = x_data;
        this.y_data = y_data;

        this.color = color;
        this.graph_type = "hist";
    }
}


exports.plotLineNoX = (stdout, argv=[]) => {
    let plot = {};
    let output = util.parseStdout(stdout);

    // setup status
    let status = bres.status_OK;
    if (bach.isWARN_NO_DATA(output.status.errcode)) {
        plot.data = null;
        status = bres.WARN_NO_DATA;
    }
    else {
        // y 
        let y = output.data;
        // x
        let x = Array.from(new Array(y.length), (val, index) => index + 1);

        let xlabel = argv[0] || "";
        let ylabel = argv[1] || "";
        let title = argv[2] || "";

        plot.data = new line(x, y, xlabel, ylabel, title);
    }

    plot.status = status

    return plot;
}

exports.plotLineWithX = (x, y, xlabel = "", ylabel = "", title = "") => {
    let plot = {};

    // setup status
    let status = bres.status_OK;
    if (y.length === 0) {
        plot.data = null;
        status = bres.WARN_NO_DATA;
    }
    else {
        plot.data = new line(x, y, xlabel, ylabel, title);
    }
    plot.status = status

    return plot;
}


exports.plotHist = (stdout, argv) => {
    let plot = {};
    let amount;
    if (argv.length >= 1) {
        amount = argv[0];
    }
    else {
        throw Error("Err: Expect argument array length more than 1.");
    }
    
    if(isNaN(amount) || amount < 1) {
        plot.data = null;
        plot.status = bres.ERR_AMOUNT_NULL;
        return plot;
    }

    let output = util.parseStdout(stdout);
    let status = bres.status_OK;
    // setup status
    if (bach.isWARN_NO_DATA(output.status.errcode)) {
        plot.data = null;
        status = bres.WARN_NO_DATA;
    }
    else {
        //y的数据
        let y = output.data;

        var max = y[0];
        var min = y[0];

        // 找最大最小值
        for (var i = 1; i < y.length; i++) {
            if (y[i] >= max) {
                max = y[i];
            }
            if (y[i] <= min) {
                min = y[i]

            }
        }
        // 确保所有数都在区间内
        max += 1;
        min -= 1;


        //x轴的数据
        let x_data = [];
        //区间大小
        let interval = (max - min) / amount;
        for (var i = 0; i < amount; i++) {
            x_data[i] = interval * (i + 1) + min;
        }

        //y轴的数据
        let y_data = [];


        // initialize
        for (let i = 0; i < x_data.length; i++) {
            y_data[i] = 0;
        }
        //循环遍历y数组；判断y数组元素在哪个区间内 就+1,否则进入下一个区间进行判断
        for (let i = 0; i < y.length; i++) {
            //初始化第一个区间
            let range_0 = min;
            let range_1 = x_data[0];
            //初始化y_data的索引
            let range_i = 0;
            while (true) {
                //如果y[i]在对应区间内跳出循环，进入下一次判断
                if (y[i] >= range_0 && y[i] < range_1) {
                    y_data[range_i] += 1;
                    break;
                }
                //进入下一个区间进行判断
                range_0 += interval;
                range_1 += interval;
                range_i++;
            }
        }
        plot.data = new hist(x_data, y_data);

    }
    plot.status = status;

    return plot;
}

exports.line = line;
exports.hist = hist;