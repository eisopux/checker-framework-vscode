// The MIT License(MIT)
// Copyright(c) 2016 George Fraser
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and / or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// source: https://github.com/georgewfraser/vscode-javac

import * as fs from "fs";
import * as path from "path";

export function findJavaExecutable(binname: string) {
  binname = correctBinname(binname);

  // First search each JAVA_HOME bin folder
  if (process.env["JAVA_HOME"]) {
    let workspaces = process.env["JAVA_HOME"].split(path.delimiter);
    for (let i = 0; i < workspaces.length; i++) {
      let binpath = path.join(workspaces[i], "bin", binname);
      if (fs.existsSync(binpath)) {
        return binpath;
      }
    }
  }

  // Then search PATH parts
  if (process.env["PATH"]) {
    let pathparts = process.env["PATH"].split(path.delimiter);
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
  if (process.platform === "win32") return binname + ".exe";
  else return binname;
}
