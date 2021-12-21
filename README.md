# Checker Framework for VS Code
Testline 1

This project is an extension for VS Code to provide the features of the [Checker Framework](https://checkerframework.org/),
via the [Checker Framework Language Server](https://github.com/eisopux/checker-framework-languageserver).


## Getting Started

After installing this extension, when you open or save any `.java` file it will be checked
by the Checker Framework [Nullness Checker](https://checkerframework.org/manual/#nullness-checker).
Other type systems and options can be enabled in the configuration.

The first time the extension is run, two dependencies will be downloaded: the latest version of the
Checker Framework ([typetools/checker-framework](https://github.com/typetools/checker-framework))
and the [Checker Framework Language Server](https://github.com/eisopux/checker-framework-languageserver).

### Prerequisites

A JDK is required, i.e. `JAVA_HOME` needs to be properly set. JDK versions 8, 9, and 11 are supported. Node.js and yarn are also required.

### Configuration

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
See the list of all [Checker Framework options](https://checkerframework.org/manual/#checker-options).

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
The default is `typetools`.

Sample setting:

```
"checker-framework.checkerframework_org": "typetools"
```

#### `checkerframework_repo`

This specifies from which Github repository under `checkerframework_org` to download the Checker Framework.
The default is `checker-framework`.

Combined with `checkerframework_org`, the default Checker Framework is `typetools/checker-framework`.

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

## Developer's Guide

To set up and build from the command line, perform the following steps:
1. Install dependencies using `yarn install`.
2. Run `yarn global add vsce`.
3. In the root of the project, run `vsce package` to generate a `.vsix` file 
4. Run `code --install-extension my-extension-0.0.1.vsix`, replacing `my-extension-0.0.1.vsix` with the created `.vsix` file. 

Under `View -> Extensions` in VS Code check that the 'checker-framework-language-server' is installed. 

During development, you can simply start the program from the command line and run as a new VS Code instance:
1.  Install dependencies using `yarn install`.
2.  Open up this project (`checker-framework-vscode`) in VS Code and start a new instance by clicking on `Run`
    in the menu bar, then `Start Debugging`. 
4.  Open a `.java` file (this can be a simple Hello World example) in the `[Extension Development Host]` instance of VSCode.


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
