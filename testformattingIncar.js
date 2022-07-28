const fs = require('fs');

function parseIncarnation(filename) {
    const passages = fs.readFileSync(filename, 'utf-8');
    const passageArr = passages.split(/[\n]/);

    const maxlength = '19 Therefore whoever relaxes one of the least of these commandments and teaches others to do the same will be called least in the kingdom of heaven, but whoever does them and teaches them will be called great in the kingdom of heaven. 20 For I tell you, unless your righteousness exceeds that of the scribes and Pharisees, you will never enter the kingdom of heaven.'.length;
    
    let createdSections = [];
    let currSection = '';
    for (const verse of passageArr)
    {
        const words = verse.split(' ')
        for (const word of words)
        {
            const trimmedWord = word.trim();
            if (trimmedWord && trimmedWord.length + currSection.length > maxlength)
            {
                createdSections.push(currSection.trim() + '\n');
                currSection = trimmedWord + ' ';
            }
            else
            {
                currSection += trimmedWord + ' ';
            }

        }
        if (currSection != ' ')
        {
            createdSections.push(currSection.trim() + '\n');
        }
        currSection = '';
    }
    return createdSections;
}

module.exports = parseIncarnation;