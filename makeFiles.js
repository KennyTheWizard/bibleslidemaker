const fs = require('fs');

function makePsalmsFiles() {
    for (let i = 23; i <= 150; i++) {
        fs.writeFile(`./treasuryOfDavid/psalm${i}.txt`, '', function (err) {
        if (err) throw err;
        console.log(`Saved! ${i}`);
        });
    }
}

makePsalmsFiles();