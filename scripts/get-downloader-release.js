const https = require('https');
const fs = require('fs');

const REPO = "eisopux/checker-framework-languageserver-downloader";
const API_URL = `https://api.github.com/repos/${REPO}/releases/latest`;
const RELEASES_URL = `https://api.github.com/repos/${REPO}/releases`;
const JAR = "./checker-framework-languageserver-downloader.jar";

function downloadFile(url, destination, callback) {
    https.get(url, (response) => { 
        // 302 is the HTTP status code for a temporary redirect. 
        if (response.statusCode === 302) {
            if (!response.headers.location) {
                console.error(`Redirect response (302) missing required Location header for ${url}.`);
                process.exit(1);
            }
            downloadFile(response.headers.location, destination, callback);
            return;
        }
        if (response.statusCode !== 200) {
            console.error(`Unexpected status code ${response.statusCode} while downloading ${url}.`);
            process.exit(1);
        }
        
        const file = fs.createWriteStream(destination);
        response.pipe(file);
        file.on('finish', () => {
            file.close(callback);
        });
    }).on('error', (error) => {
        console.error(`Got error during file download: ${error.message}`);
        process.exit(1);
    });
}

function requestJson(url, callback) {
    https.get(url, {
        headers: {
            'User-Agent': 'Node.js',
            'Accept': 'application/vnd.github+json'
        }
    }, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            if (response.statusCode !== 200) {
                console.error(`GitHub API request failed (${response.statusCode}) for ${url}: ${data}`);
                process.exit(1);
            }
            try {
                callback(JSON.parse(data));
            } catch (error) {
                console.error(`Failed to parse JSON from ${url}: ${error.message}`);
                process.exit(1);
            }
        });
    }).on('error', (error) => {
        console.error(`Got error requesting ${url}: ${error.message}`);
        process.exit(1);
    });
}

function getAssetDownloadUrl(release) {
    if (!release || !Array.isArray(release.assets)) {
        return null;
    }

    const jarAsset = release.assets.find(
        (asset) =>
            typeof asset.name === 'string' &&
            asset.name.endsWith('.jar') &&
            typeof asset.browser_download_url === 'string'
    );
    if (jarAsset) {
        return jarAsset.browser_download_url;
    }

    const firstAsset = release.assets.find(
        (asset) => typeof asset.browser_download_url === 'string'
    );
    return firstAsset ? firstAsset.browser_download_url : null;
}

function downloadFromReleaseAssets(downloadUrl) {
    downloadFile(downloadUrl, JAR, () => {
        console.log(`Downloaded the latest release to ${JAR}.`);
        process.exit(0);
    });
}

requestJson(API_URL, (latestRelease) => {
    const latestDownloadUrl = getAssetDownloadUrl(latestRelease);
    if (latestDownloadUrl) {
        downloadFromReleaseAssets(latestDownloadUrl);
        return;
    }

    requestJson(RELEASES_URL, (releases) => {
        if (!Array.isArray(releases)) {
            console.error(`Unexpected releases payload from ${RELEASES_URL}.`);
            process.exit(1);
        }
        for (const release of releases) {
            const downloadUrl = getAssetDownloadUrl(release);
            if (downloadUrl) {
                downloadFromReleaseAssets(downloadUrl);
                return;
            }
        }
        console.error('No downloadable release assets found.');
        process.exit(1);
    });
});
