const parseResponse = require('./formatVerses');
const eslKey = require('./keys.json').esvapi;
function fetchPassage(chapter)
{
    
    const url = `https://api.esv.org/v3/passage/text/?q=${chapter}&include-passage-references=false&include-footnotes=false&include-headings=false`;
    
    const headers = {
        Authorization: eslKey,
    };
    
    return fetch(url, { headers })
        .then(data => data.json())
        .then(data => {
            return parseResponse(data)
        });
}

module.exports = fetchPassage;