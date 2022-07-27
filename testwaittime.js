async function waitTime(time)
{
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), time);
    })
}

async function testWaitTime()
{
    for (let i = 0; i < 5; i++)
    {
        console.log("Loop ", i);
        await waitTime(500);
    }
}

testWaitTime();