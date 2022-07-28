const fs = require('fs');
const getSections = require('./fetchEsl');

getSections('Matthew+6').then((sections => {
    console.log(sections);
}));