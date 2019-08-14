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
    // TODO: make the installation process tidier
    let installer = new Installer();
    let serverInstalled = installer.isServerInstalled();
    let checkerInstalled = false;
    let checkerPath = '';
    let languageServerPath = '';

    if (!serverInstalled) {
        // TODO: handle failure
        installer.installServer().then((serverPath) => {
            serverInstalled = true;
            languageServerPath = serverPath;
            vscode.workspace
                .getConfiguration(strings.Misc.pluginID)
                .update('fatjarPath', serverPath);
            console.log('Using downloaded language server', serverPath);
            tryLaunch();
        });
    } else {
        languageServerPath = installer.getLanguageServerPath();
        console.log('Using installed language server', languageServerPath);
        tryLaunch();
    }

    let frameworkPath = getConfig<string>('frameworkPath');
    // if not specified, use the default
    if (frameworkPath) {
        checkerPath = path.join(frameworkPath, strings.Misc.checkerRelPath);
        console.log('Using local checker framework', checkerPath);
        checkerInstalled = true;
        tryLaunch();
    } else {
        if (installer.isCheckerInstalled()) {
            checkerPath = installer.getCheckerPath();
            console.log('Using installed checker framework', checkerPath);
            checkerInstalled = true;
            tryLaunch();
        } else {
            // TODO: handle failure
            installer.installChecker().then(() => {
                checkerPath = installer.getCheckerPath();
                console.log('Using downloaded checker framework', checkerPath);
                vscode.workspace
                    .getConfiguration(strings.Misc.pluginID)
                    .update('frameworkPath', installer.getFrameworkPath());
                checkerInstalled = true;
                tryLaunch();
            });
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

function getServerArgs(checkerPath: string, fatJarPath: string) {
    let classpath = ['.', checkerPath, fatJarPath].join(':');
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