async function foo() {
    try {
        console.log(1);
        await test.bar();
        console.log(2);
    } catch (err) {
        console.log(err)   
    }
}

class test {
    static async bar() {
        await query()
    }
}


function query() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error());
        }, 1000);        
    })
}

foo()