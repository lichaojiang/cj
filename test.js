async function test1() {
    return await Promise.reject(Error(1))
}

async function test2() {
    return test1()
    console.log(2)
}

test2().catch(err => {console.log(err)})