// MIT licensed code from: https://github.com/DafnyVSCode/Dafny-VSCode

import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';

import * as vscode from 'vscode';
import uri from 'vscode-uri';
import * as DecompressZip from 'decompress-zip';
import { https as redirect } from "follow-redirects";

import * as strings from './strings';

export class Installer {

    public basePath = this.resolvePath(path.join(__dirname, '..', 'download'));
    private cfDownloadFile = this.resolvePath(path.join(this.basePath, strings.Misc.checkerFrameworkZip));
    private langserverDownloadFile = this.resolvePath(path.join(this.basePath, strings.Misc.languageServerFatJar));

    private UA = 'Mozilla/5.0 (Windows NT x.y; rv:10.0) Gecko/20100101 Firefox/10.0';

    constructor() {
    }

    public getFrameworkPath(): string {
        let endInd = strings.Misc.checkerFrameworkZip.indexOf('.zip');
        return path.join(
            this.basePath,
            strings.Misc.checkerFrameworkZip.slice(0, endInd)
        );
    }

    public getCheckerPath(): string {
        return path.join(
            this.getFrameworkPath(),
            strings.Misc.checkerRelPath);
    }

    public getLanguageServerPath(): string {
        return this.langserverDownloadFile;
    }

    public async installServer(): Promise<string> {
        try {
            if (!fs.existsSync(this.basePath)) {
                fs.mkdirSync(this.basePath);
            }
            fs.unlink(this.langserverDownloadFile, (err) => {});
            await this.download(strings.Misc.languageServerURL, this.langserverDownloadFile);
            return Promise.resolve(this.langserverDownloadFile);
        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        }
    }

    public async installChecker(): Promise<string> {
        try {
            if (!fs.existsSync(this.basePath)) {
                fs.mkdirSync(this.basePath);
            }
            await this.downloadCheckerFramework();
            await this.extract(this.cfDownloadFile);
            return Promise.resolve(this.getFrameworkPath());
        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        }
    }

    public uninstall(): void {
        const path = this.basePath;
        if (fs.existsSync(path)) {
            console.log('remove ' + path);
            this.deleteFolderRecursive(path);
        }
    }

    private downloadCheckerFramework(): Promise<boolean> {
        fs.unlink(this.cfDownloadFile, (err) => {});
        return this.download(strings.Misc.checkerFrameworkURL, this.cfDownloadFile);
    }

    private resolvePath(str: string) {
        if (str.substr(0, 2) === '~/') {
            str = (process.env.HOME || process.env.HOMEPATH || process.env.HOMEDIR || process.cwd()) + str.substr(1);
        }
        return path.resolve(str);
    }

    private deleteFolderRecursive(path: string) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach((file) => {
                const curPath = path + '/' + file;
                if (fs.lstatSync(curPath).isDirectory()) {
                    this.deleteFolderRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }

    private download(url: string, filePath: string): Promise<boolean> {
        const options: https.RequestOptions = {
            headers: {
                'User-Agent': this.UA,
            },
            host: uri.parse(url).authority,
            path: uri.parse(url).path,
        };

        const file = fs.createWriteStream(filePath);
        console.log('downloading', url, 'to', filePath);

        return new Promise<boolean>((resolve, reject) => {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Downloading ' + url,
                cancellable: false
            }, (progress, token) => {
                var p = new Promise((resolve, reject) => {
                    const request = redirect.get(options, (response: any) => {
                        response.pipe(file);
                        const len = parseInt(response.headers['content-length'], 10);
                        let cur = 0;
                        response.on('data', (chunk: string) => {
                            cur += chunk.length;
                            progress.report({
                                increment: 100.0 * chunk.length / len,
                                message: cur + '/' + len
                            });
                        });

                        file.on('finish', () => {
                            file.close();
                            resolve();
                        });
                    });
                    request.on('error', (err: Error) => {
                        fs.unlink(filePath, (err) => { });
                        reject(err);
                    });
                });
                return p;
            }).then(value => {
                resolve(true);
            }, reason => {
                reject(reason);
            });
        });
    }

    private extract(filePath: string): Promise<boolean> {
        return new Promise<any>((resolve, reject) => {
            try {
                console.log('extracting', filePath);
                let unzipper = new DecompressZip(filePath);

                unzipper.on('error', (e: any) => {
                    console.error('Error extracting ' + filePath + ': ' + e);
                    return reject(e);
                });

                unzipper.on('extract', () => {
                    return resolve();
                });

                if (!fs.existsSync(this.basePath)) {
                    fs.mkdirSync(this.basePath);
                }
                unzipper.extract({
                    path: this.basePath,
                });
            } catch (e) {
                console.error('Error extracting ' + filePath + ': ' + e);
                return reject(false);
            }
        });

    }

}
