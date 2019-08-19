/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as fs from "fs";
import * as path from 'path';

import * as vscode from 'vscode';
import * as vscodelc from 'vscode-languageclient';

import * as strings from './strings';
import { Installer } from './installer';

export function activate(context: vscode.ExtensionContext) {
    let serverInstalled = false;
    let checkerInstalled = false;
    let installer = new Installer();

    // If specified in conf, use conf, otherwise download & install
    let languageServerPath = getConfig<string>('languageServerPath');
    let frameworkPath = getConfig<string>('frameworkPath');

    // Language server
    console.log('Looking for language server at', languageServerPath);
    if (languageServerPath && fs.existsSync(languageServerPath)) {
        console.log('Using local language server', languageServerPath);
        serverInstalled = true;
        tryLaunch();
    } else {
        if (!languageServerPath) {
            // not specified, download
            console.log('Language server not specified, will download');
            installer.installServer().then((serverPath) => {
                serverInstalled = true;
                languageServerPath = serverPath;
                setConfig('languageServerPath', serverPath);
                console.log('Using downloaded language server', serverPath);
                tryLaunch();
            }).catch((reason) => {
                vscode.window.showErrorMessage('Failed to install language server: ' + reason);
            });
        } else {
            // specified but not exists, ask to correct & reload
            vscode.window.showErrorMessage('Language server is not found at ' + languageServerPath + ' which is specified in your configuration. Please correct or remove this section and reload VS Code.');
        }
    }

    // Checker framework
    console.log('Looking for checker framework at', frameworkPath);
    let checkerPath = path.join(frameworkPath, strings.Misc.checkerRelPath);
    if (frameworkPath && fs.existsSync(checkerPath)) {
        console.log('Using local checker framework', checkerPath);
        checkerInstalled = true;
        tryLaunch();
    } else {
        if (!frameworkPath) {
            // not specified, download
            console.log('Checker framework not specified, will download');
            installer.installChecker().then((cfPath) => {
                checkerInstalled = true;
                frameworkPath = cfPath;
                checkerPath = path.join(frameworkPath, strings.Misc.checkerRelPath);
                setConfig('frameworkPath', frameworkPath);
                console.log('Using downloaded checker framework', frameworkPath);
                tryLaunch();
            }).catch((reason) => {
                vscode.window.showErrorMessage('Failed to install Checker framework: ' + reason);
            });
        } else {
            // specified but not exists, ask to correct & reload
            vscode.window.showErrorMessage('Checker framework is not found at ' + frameworkPath + ' which is specified in your configuration. Please correct or remove this section and reload VS Code.');
        }
    }

    function tryLaunch() {
        if (serverInstalled && checkerInstalled)
            launch();
    }

    function launch() {
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