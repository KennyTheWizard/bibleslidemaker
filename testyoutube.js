const videoUrl = "https://www.youtube.com/playlist?list=PLfqlfKzf7YaAap_FN3xkuwZgRrKleFJN-";
const requestUrl = `https://youtube.com/oembed?url=${videoUrl}&format=json`;
fetch(requestUrl)
    .then(data => data.json())
    .then(data => console.log(JSON.stringify(data, null, 2)));