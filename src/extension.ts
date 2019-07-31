/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as fs from "fs";
import * as path from 'path';

import * as vscode from 'vscode';
import * as vscodelc from 'vscode-languageclient';

import * as strings from './strings';

export function activate(context: vscode.ExtensionContext) {
    let serverOptions: vscodelc.ServerOptions = {
        command: findJavaExecutable('java'),
        args: getServerArgs(),
    };

    console.log(serverOptions);

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

function getServerArgs() {
    let frameworkPath = getConfig<string>('frameworkPath');
    let checkerPath = path.join(frameworkPath, strings.Misc.checkerRelPath);
    let fatJarPath = getConfig<string>('fatjarPath');
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