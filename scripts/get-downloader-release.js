const https = require('https');
const fs = require('fs');
const url = require('url');

const REPO = "eisopux/checker-framework-languageserver-downloader";
const API_URL = `https://api.github.com/repos/${REPO}/releases/latest`;
const JAR = "./checker-framework-languageserver-downloader.jar";

https.get(API_URL, {
    headers: {
        'User-Agent': 'Node.js'
    }
}, (response) => {
    let data = '';

    response.on('data', (chunk) => {
        data += chunk;
    });

    response.on('end', () => {
        const jsonResponse = JSON.parse(data);
        const downloadUrl = jsonResponse.assets[0].browser_download_url;

        const file = fs.createWriteStream(JAR);
        https.get(new URL(downloadUrl), (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => {
                    console.log(`Downloaded the latest release to ${JAR}.`);
                });
            });
        });
    });
}).on('error', (error) => {
    console.error(`Got error: ${error.message}`);
});
