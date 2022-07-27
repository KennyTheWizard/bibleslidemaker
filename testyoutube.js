const videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const requestUrl = `https://youtube.com/oembed?url=${videoUrl}&format=json`;
fetch(requestUrl)
    .then(data => data.json())
    .then(data => console.log(JSON.stringify(data, null, 2)));