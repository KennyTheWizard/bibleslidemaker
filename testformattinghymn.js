const fs = require('fs');

function parseHymn(filename) {
    const passages = fs.readFileSync(filename, 'utf-8');
    const passageArr = passages.split(/[\n]{2}/);

    const response = 'Response:\n' + passageArr[0];
    let createdSections = [];
    let currSection = '';
    for (let i = 1; i < passageArr.length; i++)
    {
        const lines = passageArr[i].split(/[\n]/);
        const half = Math.ceil(lines.length / 2);
        for (let j = 0; j < lines.length; j++)
        {
            const line = lines[j];
            if (j != half)
            {
                currSection += line + '\n';
            }
            else
            {
                createdSections.push(currSection);
                currSection = line + '\n';
            }
        }
        createdSections.push(currSection);
        currSection = '';
        createdSections.push(response);
    }

    return createdSections;
}

module.exports = parseHymn;