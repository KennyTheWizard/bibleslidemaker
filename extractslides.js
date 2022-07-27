const fs = require('fs');
const getSections = require('./testesl');

getSections('1+John+1').then((sections => {
    console.log(sections);
}));