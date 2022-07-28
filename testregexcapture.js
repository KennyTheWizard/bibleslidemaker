const input = require('./inputjson/Week17.json');
for (const videoUrl of input.videos)
{
    var regex = /v=(\w{11})/;
    const url = regex.exec(videoUrl);
    console.log(url[1]);
}