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

function fetchSearch(search, page = 1)
{
    const url = `https://api.esv.org/v3/passage/search?q=${search}&page-size=100&page=${page}`;
    
    const headers = {
        Authorization: eslKey,
    };
    
    return fetch(url, { headers })
        .then(data => data.json())
        .then(data => {
            // return parseResponse(data)
            return data;
        });
}

// async function doWork()
// {
//     let verses = [];
//     let total_pages = 1000;
//         const resp = await fetchPassage("1 Cor. 13:4-7");
//         console.log(resp);
//     return verses;
// }

// doWork().then(data => {
//     console.log(JSON.stringify(data, null, 4));



// });

module.exports = fetchPassage;