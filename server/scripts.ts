import { appSettings } from "./constants";
import { Request, Response } from "express";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { ChildProcess } from "concurrently/dist/src/command";
import { filenameToNumber } from "../common/utils";

export class ScriptCaller {
  static command: string;
  static args: string[];

  static setup() {
    if (process.platform === "win32") {
      this.command = appSettings.windowsScriptExecutor;
      this.args = ["/c"];
    } else {
      // For non-Windows machines, use a terminal program
      this.command = process.env.SHELL || appSettings.shellExecutor; // get the user's default shell program
      this.args = [];
    }
  }

  static callFile(scriptFile: string, args: string[] = []) {
    return spawn(this.command, [...this.args, scriptFile, ...args]);
  }

  static defaultOutput(script: ChildProcessWithoutNullStreams, res: Response) {
    let failed = false;
    
    script.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    script.stderr.on("data", (data) => {
      console.log(`stderr: ${data}`);
      failed = true;
    });

    script.on("close", (code) => {
      if (failed) return res.status(400).send("Could not resolve hostname");
      return res.send("OK");
    });
  }
}

ScriptCaller.setup();

export function playSoundFile(req: Request, res: Response) {
  const filename = req.body.filename;
  const script = ScriptCaller.callFile(appSettings.playRemoteScript, [filenameToNumber(filename).toString()])
  ScriptCaller.defaultOutput(script, res);
}