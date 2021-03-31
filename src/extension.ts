/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as fs from 'fs';
import * as path from 'path';
import * as child from 'child_process';

import * as vscode from 'vscode';
import * as vscodelc from 'vscode-languageclient/node';

import * as strings from './strings';
import * as findjava from './findjava';

export function activate(context: vscode.ExtensionContext) {
    let serverInstalled = false;
    let checkerInstalled = false;

    // If specified in conf, use conf, otherwise download & install

    //This value is dependent on the version of the jar file, check in your Ubuntu machine
    let languageServerPath= path.join(__dirname, '..', '/checker-framework-languageserver-downloader-0.2.0.jar');
    if (languageServerPath && fs.existsSync(languageServerPath)) {
        console.log('Using local language server', languageServerPath);
        serverInstalled = true;
    }

    //This value is dependent on the checker-framework version
    let frameworkPath=path.join(__dirname, '..', 'download/checker-framework-3.11.0');
    let checkerPath=path.join(__dirname, '..', 'download/checker-framework-3.11.0/checker/dist/checker.jar');
   
    if ( frameworkPath && fs.existsSync(checkerPath)) {
        console.log('Using local checker framework', checkerPath);
        checkerInstalled = true;
    }
    if (!serverInstalled || !checkerInstalled) {
        console.log('Server installed:', serverInstalled, ', Checker installed:', checkerInstalled);
        vscode.window.showInformationMessage('Downloading dependencies...');
        downloadDeps(async (server: string, cf: string) => {
            console.log('Downloaded', server, 'and', cf);
            if (!serverInstalled) {
                languageServerPath = server;
                await setConfig(strings.Misc.optLanguageServerPath, languageServerPath);
            }
            if (!checkerInstalled) {
                //This value is dependent on the checker-framework version
                frameworkPath = path.join(__dirname, '..', 'download/checker-framework-3.11.0');
                checkerPath = path.join(__dirname, '..', 'download/checker-framework-3.11.0/checker/dist/checker.jar')
                await setConfig(strings.Misc.optFrameworkpath, frameworkPath);
            }
            vscode.window.showInformationMessage('Finished downloading');
            launchLS();
            fs.existsSync(checkerPath)
        });
    } else launchLS();

    function launchLS() {
        let serverOptions: vscodelc.ServerOptions = {
            command: findjava.findJavaExecutable('java'),
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
    
    let args = [
        '-jar',
        path.join(__dirname, '..', 'checker-framework-languageserver-downloader-0.2.0.jar'),
        '-dest',
        path.join(__dirname, '..', 'download'),
        '-' + strings.Misc.optCFOrg,
        getConfig<string>(strings.Misc.optCFOrg),
        '-' + strings.Misc.optCFRepo,
        getConfig<string>(strings.Misc.optCFRepo),
        '-' + strings.Misc.optLSOrg,
        getConfig<string>(strings.Misc.optLSOrg),
        '-' + strings.Misc.optLSRepo,
        getConfig<string>(strings.Misc.optLSRepo)
    ]

    
    var server = '';
    var framework = '';
    let argument="java -jar "+path.join(__dirname, '..', 'checker-framework-languageserver-downloader-0.2.0.jar')+" -dest "+path.join(__dirname, '..', 'download');
    
    //exec is used instead of spawn
    child.exec(argument, (error, stdout, stderr) =>{
    
        if (error){
            console.log('error'+ error);
            return;
        }
        if (stderr){
            console.log('stderr:'+ stderr);
        }
        
        let str=stdout.toString();
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
        callback(server, framework);
        });    
}

function getServerArgs(checkerPath: string, fatjarPath: string) {
    //This value is dependent on the checker-framework version
    var checkerPath=path.join(__dirname, '..', '/download/checker-framework-3.11.0/checker/dist/checker.jar');
    var fatjarPath=path.join(__dirname, '..', '/download/checker-framework-languageserver-0.1.1-java8.jar');
    let classpath = ['.', checkerPath, fatjarPath].join(path.delimiter);
    let mainClass = strings.Misc.serverMainClass;
    let args = [
        '-cp',
        classpath,
        mainClass,
        '-' + strings.Misc.optFrameworkpath,
        path.join(__dirname, '..', '/download/checker-framework-3.11.0')
    ];
    getConfig<Array<string>>(strings.Misc.optCheckers).forEach(c => {
        args.push('-' + strings.Misc.optCheckers);
        args.push(c);
    });
    getConfig<Array<string>>(strings.Misc.optCommandLineOptions).forEach(c => {
        args.push('-' + strings.Misc.optCommandLineOptions);
        args.push(c);
    });
    return args;
}

function getConfig<T>(name: string): T {
    return vscode.workspace.getConfiguration(strings.Misc.pluginID).get<T>(name);
}

function setConfig<T>(name: string, value: any): Thenable<void> {
    return vscode.workspace.getConfiguration(strings.Misc.pluginID).update(name, value);
}
