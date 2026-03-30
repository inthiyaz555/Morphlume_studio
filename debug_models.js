const https = require('https');

const apiKey = "AIzaSyAIBEpxooeWd2jyKDVgClCtbO3AU0VRSiU";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log("Status Code:", res.statusCode);
    console.log("Response Body:", data);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
