function parsePassage(retObj) {
    const passage = retObj.passages[0];

    const maxlength = '19 Therefore whoever relaxes one of the least of these commandments and teaches others to do the same will be called least in the kingdom of heaven, but whoever does them and teaches them will be called great in the kingdom of heaven. 20 For I tell you, unless your righteousness exceeds that of the scribes and Pharisees, you will never enter the kingdom of heaven.'.length;
    const passageArr = passage.split(/(\[[0-9]*\])/);

    const passageReformatted = [];
    let verseNumber = '';
    for (const verse of passageArr)
    {
        if (verse.trim().length === 0) continue;
        if (verse.match(/(\[[0-9]*\])/))
        {
            verseNumber = verse;
        }
        else
        {
            const splitNewline = verse.split('\n').map(p => p.trim()).join(' ');
            passageReformatted.push(verseNumber + splitNewline.trim());
            verseNumber = '';
        }
    }
    let createdSections = [];
    let currLength = 0;
    let currSection = '';
    for (let i = 0; i < passageReformatted.length; ++i)
    {
        if (passageReformatted[i] && passageReformatted[i].length + currSection.length > maxlength)
        {
            createdSections.push(currSection.trim() + '\n');
            currSection = passageReformatted[i] + ' ';
        }
        else
        {
            currSection += passageReformatted[i] + ' ';
        }
    }
    createdSections.push(currSection);
    

    return { reference: retObj.canonical, passage: createdSections };
}

module.exports = parsePassage;