# Checker Framework for VS Code

This project is an extension for VS Code providing the features of [Checker Framework](https://checkerframework.org/).

## Getting Started

After installing this extension, open or save any `.java` file and it will be checked by Checker Framework using the [Nullness Checker](https://checkerframework.org/manual/#nullness-checker).

The first time the extension gets running, dependencies will be downloaded: the latest version of Checker Framework([typetools/checker-framework](https://github.com/typetools/checker-framework)), and a [language server](https://github.com/eisopux/checker-framework-languageserver) wrapping around the Checker Framework.

### Prerequisites

JDK is required, i.e. `JAVA_HOME` needs to be properly set. Versions supported are 8, 9 and 11.

### Configuration

Several parameters are available:

#### checkers

This is a list of checkers that you want to use to check source files. Shorthand names and long full names are both supported. The list of all checkers can be found in the [manual](https://checkerframework.org/manual) of Checker Framework.

```
"checker-framework.checkers": [
    "interning",
    "org.checkerframework.checker.nullness.NullnessChecker"
]
```

#### commandLineOptions

This is a list of command line options that will be passed to the Checker Framework, which are options of a normal javac.

Sample setting:

```
"checker-framework.commandLineOptions": [
    "-proc:only"
]
```

#### frameworkPath

This is the path to the root folder of Checker Framework that's going to be used. Normally it's the directory obtained after unzipping the zip downloaded. By default, this extension will set this up for you.

Sample setting:

```
"checker-framework.frameworkPath": "/Users/joe/env/checker-framework-3.0.0"
```

#### languageServerPath

This is the path of the jar file of the language server. This will usually be set up automatically.

Sample setting:

```
"checker-framework.languageServerPath": "/Users/bob/env/checker-framework-languageserver-all.jar"
```

### checkerframework_org

This specifies from which Github organization to download Checker Framework. The default is `typetools`.

Sample setting:

```
"checker-framework.checkerframework_org": "typetools"
```

### checkerframework_repo

This specifies from which Github repository under `checkerframework_org` to download Checker Framework. The default is `checker-framework`.

Combined with `checkerframework_org`, the default Checker Framework is `typetools/checker-framework`.

Sample setting:

```
"checker-framework.checkerframework_repo": "checker-framework"
```

### languageserver_org

This specifies from which Github organization to download the language server. The default is `eisopux`.

Sample setting:

```
"checker-framework.languageserver_org": "eisopux"
```

### languageserver_repo

This specifies from which Github repository under `languageserver_org` to download the language server. The default is `checker-framework-languageserver`.

Combined with `languageserver_org`, the default language server is `eisopux/checker-framework-languageserver`.

Sample setting:

```
"checker-framework.languageserver_repo": "checker-framework-languageserver"
```

## Requirements 
Node.js and yarn is required.

## Developer's Guide

During development, you can simply start the program from the command line and run as a new instance:
1.  Install dependencies using `yarn install`
2.  Open up this project (checker-framework-vscode) on VSCode and start a new instance by clicking on `Run` in the top bar menu, then `Start Debugging`. 
3.  Open a new folder with a `.java` (this can be a simple Hello World folder) file in the VSCode with `[Extension Development Host]` instance of VSCode.

The manual method involves the following steps:
To add from the command line, you can install the extension on VSCode:
1. Install dependencies using `yarn install`
2. Run the following script `yarn global add vsce`
3. In the root of the project, run `vsce package`to generate a .vsix file 
4. Run `code --install-extension my-extension-0.0.1.vsix`, replacing my-extension-0.0.1.vsix to the .vsix file recently created. 

Under View -> Extensions on VSCode check if the 'checker-framework-language-server' is installed. 

### Deploying to VSCode Marketplace
A good resource for deploying to marketplace can be found [here](https://www.richardkotze.com/coding/deploy-vscode-extension-azure-pipeline). 


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## References

* [VS Code publishing extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

## Acknowledgments

This project is inspired and helped by the following projects:

* [adamyy/checkerframework-lsp](https://github.com/adamyy/checkerframework-lsp)
* [georgewfraser/vscode-javac](https://github.com/georgewfraser/vscode-javac)
* [adamvoss/vscode-languageserver-java-example](https://github.com/adamvoss/vscode-languageserver-java-example)
* [DafnyVSCode/Dafny-VSCode](https://github.com/DafnyVSCode/Dafny-VSCode)
