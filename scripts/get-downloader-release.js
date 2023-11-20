const https = require('https');
const fs = require('fs');

const REPO = "eisopux/checker-framework-languageserver-downloader";
const API_URL = `https://api.github.com/repos/${REPO}/releases/latest`;
const JAR = "./checker-framework-languageserver-downloader.jar";

function downloadFile(url, destination, callback) {
    https.get(url, (response) => { 
        // 302 is the HTTP status code for a temporary redirect. 
        if (response.statusCode === 302) {
            downloadFile(response.headers.location, destination, callback);
            return;
        }
        
        const file = fs.createWriteStream(destination);
        response.pipe(file);
        file.on('finish', () => {
            file.close(callback);
        });
    }).on('error', (error) => {
        console.error(`Got error during file download: ${error.message}`);
    });
}

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
        downloadFile(downloadUrl, JAR, () => {
            console.log(`Downloaded the latest release to ${JAR}.`);
            process.exit(0); 
        });
    });
}).on('error', (error) => {
    console.error(`Got error: ${error.message}`);
    process.exit(1);
});