async function test1() {
    await Promise.reject(1)
    console.log(2)
}

async function test2() {
    await test1()
}

test2().catch(err => {console.log(err)})