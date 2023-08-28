# Checker Framework for VS Code

This project is an extension for VS Code to provide the features of the [Checker Framework](https://checkerframework.org/),
via the [Checker Framework Language Server](https://github.com/eisopux/checker-framework-languageserver).


## Getting Started

You can either install the extension from the
[VS Code Extension Marketplace](https://code.visualstudio.com/docs/editor/extension-marketplace)
or install a locally-built version of the extension.
Please refer to the [Build from source](#build-from-source) section below for instructions on how to build from source.

After installing the extension, when you open or save any `.java` file it will be checked
by the Checker Framework [Nullness Checker](https://eisop.github.io/cf/manual/manual.html#nullness-checker).
Other type systems and options can be enabled in the [configuration](#configuration).

The first time the extension is run, two dependencies will be downloaded: the latest version of the
Checker Framework ([eisop/checker-framework](https://github.com/eisop/checker-framework))
and the [Checker Framework Language Server](https://github.com/eisopux/checker-framework-languageserver).

### Prerequisites

A JDK is required, i.e. `JAVA_HOME` needs to be properly set. JDK versions 8, 9, and 11 are supported. Node.js and npm are also required.

## Configuration

The following configuration parameters are available:

#### `checkers`

The list of checkers that are used to check source files. Shorthand names and full names are
both supported.
The list of all checkers can be found in the [Checker Framework manual](https://checkerframework.org/manual).

```
"checker-framework.checkers": [
    "interning",
    "org.checkerframework.checker.nullness.NullnessChecker"
]
```

#### `commandLineOptions`

The list of command-line options that are passed to the Checker Framework. This can include options to javac.
See the list of standard [Checker Framework options](https://checkerframework.org/manual/#checker-options). In 
addition, a list of options that can change the behaviors of this plugin is included in 
[LSP-related Command-Line Options](#lsp-related-command-line-options).

Sample setting:

```
"checker-framework.commandLineOptions": [
    "-proc:only"
]
```

#### `frameworkPath`

The path to the root folder of the Checker Framework to use.
The directory should follow the layout of an unzipped Checker Framework release zip file. 
By default, this extension will set this up for you.

Sample setting:

```
"checker-framework.frameworkPath": "/Users/joe/env/checker-framework-3.0.0"
```

#### `languageServerPath`

The path of the jar file of the Checker Frameowrk Language Server. This will usually be set up automatically.

Sample setting:

```
"checker-framework.languageServerPath": "/Users/bob/env/checker-framework-languageserver-all.jar"
```

#### `checkerframework_org`

This specifies from which Github organization to download the Checker Framework release.
The default is `eisop`.

Sample setting:

```
"checker-framework.checkerframework_org": "eisop"
```

#### `checkerframework_repo`

This specifies from which Github repository under `checkerframework_org` to download the Checker Framework.
The default is `checker-framework`.

Combined with `checkerframework_org`, the default Checker Framework is `eisop/checker-framework`.

Sample setting:

```
"checker-framework.checkerframework_repo": "checker-framework"
```

#### `languageserver_org`

This specifies from which Github organization to download the Checker Framework Language Server.
The default is `eisopux`.

Sample setting:

```
"checker-framework.languageserver_org": "eisopux"
```

#### `languageserver_repo`

This specifies from which Github repository under `languageserver_org` to download the Checker Framework Language Server.
The default is `checker-framework-languageserver`.

Combined with `languageserver_org`, the default language server is `eisopux/checker-framework-languageserver`.

Sample setting:

```
"checker-framework.languageserver_repo": "checker-framework-languageserver"
```


## LSP-related Command-Line Options

This section provides a list of the Checker Framework command-line options that are related to the features of this LSP 
plugin. You can turn on/off an option by adding/removing the corresponding flag in 
[`commandLineOptions`](#commandlineoptions).

- `-AlspTypeInfo`: Once enabled, the plugin will display a pop-up showing the related type information when hovering on 
some meaningful syntax in the source file. This option is enabled by default.



## Developer's Guide

### Building from source

#### Setting up the environment 

1. Install the newest Node.js version for your operating system (OS); see the [Node.Js homepage](https://nodejs.org/en/).
2. Install a Git client for your OS; see the [Git homepage](https://git-scm.com/downloads).
3. Run `npm install -g @vscode/vsce`, as superuser.
4. Run `npm add -g @vscode/vsce`.

#### Building the extension

1. Create a working directory for the project and change into it.
2. Clone the project in the new directory `git clone https://github.com/eisopux/checker-framework-vscode.git`.
3. Change into the cloned directory `cd checker-framework-vscode`.
4. Install dependencies using `npm install`, as superuser. (Use `Open command prompt (CMD) (admin)` on Windows.) See the [npm Docs](https://docs.npmjs.com/cli/v8/commands/npm-install).
5.  Run `vsce package` to generate a `.vsix` file.
6.  Run `code --install-extension checker-framework-language-server-0.2.0.vsix`; replace the `-0.2.0` with the current version number.
   
### Using a local downloader

1. Change back into your project working directory. 
2. Clone the downloader in the project directory `git clone https://github.com/eisopux/checker-framework-languageserver-downloader.git`
3. Change into the downloader folder and run `./gradlew assemble`.
   See file `[README.md](https://github.com/eisopux/checker-framework-languageserver-downloader/blob/master/README.md)` for more details.
4. Copy `build/libs/checker-framework-languageserver-downloader-all.jar` to the plugin’s folder and rename it to replace the file `checker-framework-languageserver-downloader.jar`

### Using a local language server or Checker Framework

You can use a local language server or Checker Framework. Update the appropriate field in `.vscode/settings.json` with your custom path, like in the following example:

```json
{
    "checker-framework.frameworkPath": "/path/to/custom/framework",
    "checker-framework.languageServerPath": "/path/to/custom/languageserver.jar"
}
```

Save the file and restart Visual Studio Code.

### Trouble shooting:

To get log information use `Toggle Developer Tools` in the `Command Palette` in Visual Studio Code.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## References

* [VS Code publishing extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
* [Guide to deploying to the VS Code marketplace](https://www.richardkotze.com/coding/deploy-vscode-extension-azure-pipeline). 

## Acknowledgments

This project is inspired and helped by the following projects:

* [adamyy/checkerframework-lsp](https://github.com/adamyy/checkerframework-lsp)
* [georgewfraser/vscode-javac](https://github.com/georgewfraser/vscode-javac)
* [adamvoss/vscode-languageserver-java-example](https://github.com/adamvoss/vscode-languageserver-java-example)
* [DafnyVSCode/Dafny-VSCode](https://github.com/DafnyVSCode/Dafny-VSCode)
