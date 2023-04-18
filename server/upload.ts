import fs from "fs";
import { Request, Response } from "express";
import { syncLocal } from "./sync";
import { appSettings } from "./constants";
import { spawn } from "child_process";

export const upload = (res: Response, data: number[], filename: string) => {
    let command: string, args: string[];
    if (process.platform === "win32") {
        command = appSettings.windowsScriptExecutor;
        args = ["/c"];
    } else {
        // For non-Windows machines, use a terminal program
        command = process.env.SHELL || appSettings.shellExecutor; // get the user's default shell program
        args = [];
    }

    console.log(data, filename);
    if (!syncLocal(data, filename))
        return res.status(400).send(appSettings.uploadErrorMessage);

    // // call script files
    const spawner = (currentScriptFileIndex: number = 0) => {
        if (currentScriptFileIndex == 1) {
            if (!syncLocal(data, filename))
                return res.status(400).send(appSettings.uploadErrorMessage);
        }

        const scriptFile =
            appSettings.uploadScriptFiles[currentScriptFileIndex];
        console.log(`Script ${currentScriptFileIndex}: ${scriptFile}`);

        const script = spawn(command, [...args, scriptFile]);

        script.stdout.on("data", (data) => {
            console.log(`stdout: ${data}`);
        });

        script.stderr.on("data", (data) => {
            console.log(`stderr: ${data}`);
        });

        script.on("close", (code) => {
            console.log(`child process exited with code ${code}`);
            currentScriptFileIndex++;
            if (currentScriptFileIndex < appSettings.uploadScriptFiles.length)
                setTimeout(() => {
                    spawner(currentScriptFileIndex);
                }, appSettings.scriptDelayTime);
            else res.send("OK");
        });
    };
    spawner();

    return true;
};

export const postUpload = (req: Request, res: Response) => {
    const filename = req.body.filename;

    // get the local data
    let data: number[] = [];
    fs.readFile(
        appSettings.localDataInputPath,
        appSettings.defaultEncoding,
        (err, jsonString) => {
            if (err) {
                console.log(appSettings.readErrorMessage, err);
                return res.status(500).send(appSettings.serverErrorMessage);
            }
            try {
                const jsonDictionary = JSON.parse(jsonString);
                for (const name in jsonDictionary) {
                    data = jsonDictionary[name][filename];
                    upload(res, data, filename);
                }
            } catch {
                console.log(appSettings.jsonParseErrorMessage, err);
                return res.status(400).send(appSettings.jsonParseErrorMessage);
            }
        }
    );
};
