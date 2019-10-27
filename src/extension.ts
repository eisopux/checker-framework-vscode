/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as fs from "fs";
import * as path from 'path';
import * as child from 'child_process';

import * as vscode from 'vscode';
import * as vscodelc from 'vscode-languageclient';

import * as strings from './strings';

export function activate(context: vscode.ExtensionContext) {
    let serverInstalled = false;
    let checkerInstalled = false;

    // If specified in conf, use conf, otherwise download & install
    let languageServerPath = getConfig<string>('languageServerPath');
    let frameworkPath = getConfig<string>('frameworkPath');
    let checkerPath = path.join(frameworkPath, strings.Misc.checkerRelPath);

    console.log('Looking for language server at', languageServerPath);
    if (languageServerPath && fs.existsSync(languageServerPath)) {
        console.log('Using local language server', languageServerPath);
        serverInstalled = true;
    }
    console.log('Looking for checker framework at', frameworkPath);
    if (frameworkPath && fs.existsSync(checkerPath)) {
        console.log('Using local checker framework', checkerPath);
        checkerInstalled = true;
    }
    if (!serverInstalled || !checkerInstalled) {
        console.log('Server installed:', serverInstalled, ', Checker installed:', checkerInstalled);
        vscode.window.showInformationMessage('Downloading dependencies...');
        downloadDeps((server: string, cf: string) => {
            console.log('Downloaded', server, 'and', cf);
            if (!serverInstalled) {
                languageServerPath = server;
                setConfig('languageServerPath', languageServerPath);
            }
            if (!checkerInstalled) {
                frameworkPath = cf;
                checkerPath = path.join(frameworkPath, strings.Misc.checkerRelPath);
                setConfig('frameworkPath', frameworkPath);
            }
            vscode.window.showInformationMessage('Finished downloading');
            launchLS();
        });
    } else launchLS();

    function launchLS() {
        let serverOptions: vscodelc.ServerOptions = {
            command: findJavaExecutable('java'),
            args: getServerArgs(checkerPath, languageServerPath),
        };

        console.log('serverOption', serverOptions);

        // Options to control the language client
        let clientOptions: vscodelc.LanguageClientOptions = {
            // Register the server for java documents
            documentSelector: ['java'],
            synchronize: {
                // Synchronize the setting section 'languageServerExample' to the server
                configurationSection: strings.Misc.pluginID,
                // Notify the server about file changes to '.java' files contain in the workspace
                fileEvents: vscode.workspace.createFileSystemWatcher('**/*.java')
            }
        }

        // Create the language client and start the client.
        let disposable = new vscodelc.LanguageClient(strings.Misc.pluginID, strings.Misc.pluginName, serverOptions, clientOptions).start();

        // Push the disposable to the context's subscriptions so that the
        // client can be deactivated on extension deactivation
        context.subscriptions.push(disposable);
    }
}

function downloadDeps(callback: Function) {
    let args = ['-jar', path.join(__dirname, '..', '/checker-framework-languageserver-downloader-all.jar'), path.join(__dirname, '..', 'download')]
    console.log('spawnning downloader, args:', args);
    let prc = child.spawn('java', args);

    let server = '';
    let framework = '';

    prc.stderr.on('data', function (data) {
        let str = data.toString()
        let lines = str.split(/(\r?\n)/g);
        console.log('err:', lines.join(""));
    });

    prc.stdout.on('data', function (data) {
        let str = data.toString()
        let lines = str.split(/(\r?\n)/g);
        for (let i = 0; i < lines.length; ++i) {
            let l = lines[i];
            if (l.startsWith('Got ')) {
                let p = l.split(' ')[1];
                if (!server) server = p;
                else framework = p;
            }
        }
        console.log(lines.join(""));
    });

    prc.on('close', function (code) {
        console.log('process exit code ' + code);
        callback(server, framework);
    });
}

function getServerArgs(checkerPath: string, fatjarPath: string) {
    let classpath = ['.', checkerPath, fatjarPath].join(':');
    let mainClass = strings.Misc.serverMainClass;
    return ['-cp', classpath, mainClass];
}

// MIT Licensed code from: https://github.com/georgewfraser/vscode-javac
function findJavaExecutable(binname: string) {
    binname = correctBinname(binname);

    // First search each JAVA_HOME bin folder
    if (process.env['JAVA_HOME']) {
        let workspaces = process.env['JAVA_HOME'].split(path.delimiter);
        for (let i = 0; i < workspaces.length; i++) {
            let binpath = path.join(workspaces[i], 'bin', binname);
            if (fs.existsSync(binpath)) {
                return binpath;
            }
        }
    }

    // Then search PATH parts
    if (process.env['PATH']) {
        let pathparts = process.env['PATH'].split(path.delimiter);
        for (let i = 0; i < pathparts.length; i++) {
            let binpath = path.join(pathparts[i], binname);
            if (fs.existsSync(binpath)) {
                return binpath;
            }
        }
    }

    // Else return the binary name directly (this will likely always fail downstream)
    return null;
}

function correctBinname(binname: string) {
    if (process.platform === 'win32')
        return binname + '.exe';
    else
        return binname;
}

function getConfig<T>(name: string): T {
    return vscode.workspace.getConfiguration(strings.Misc.pluginID).get<T>(name);
}

function setConfig<T>(name: string, value: any) {
    vscode.workspace.getConfiguration(strings.Misc.pluginID).update(name, value);
}