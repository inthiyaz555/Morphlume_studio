const https = require('https');

const apiKey = "AIzaSyBpAF_Vcc41aIoW1PVljNfwwz2-en8OdcE";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.models) {
        console.log("FULL_LIST_START");
        json.models.forEach(m => {
           if (m.name.includes("imagen") || m.name.includes("generate")) {
             console.log(m.name);
           }
        });
        console.log("FULL_LIST_END");
      }
    } catch (e) {
      console.log("Parse Error:", e.message);
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
