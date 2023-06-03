import fs from "fs";
import { Request, Response } from "express";
import { syncLocal } from "./sync";
import { appSettings } from "./constants";
import { appSettings as clientAppSettings } from "../src/constants";
import { ScriptCaller } from "./scripts";

export const upload = (res: Response, data: string[], filename: string) => {
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

  // // call script files
  const spawner = (currentScriptFileIndex: number = 0) => {
    const scriptFile = appSettings.uploadScriptFiles[currentScriptFileIndex];
    console.log(`Script ${currentScriptFileIndex}: ${scriptFile}`);

    const script = ScriptCaller.callFile(scriptFile);
    let failed = false;

    script.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    script.stderr.on("data", (data) => {
      console.log(`stderr: ${data}`);
      failed = true;
    });

    script.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      if (currentScriptFileIndex == 0) { // first script should be sync script.
        if (!syncLocal(data, filename))
          return res.status(400).send(appSettings.uploadErrorMessage);
      }
      if (failed) 
        return res.status(400).send(data.toString().trim());
      currentScriptFileIndex++;
      if (currentScriptFileIndex < appSettings.uploadScriptFiles.length)
        setTimeout(() => {
          if (failed) return;
          spawner(currentScriptFileIndex);
        }, appSettings.scriptDelayTime);
      else return res.send("OK");
    });
  };
  spawner();
};

export const mergeAllData = (filename: string, jsonDictionary: any) => {
  let indices: { [name: keyof typeof jsonDictionary]: number } = {};
  let characterIdentifiers: {
    [name: keyof typeof jsonDictionary]: number;
  } = {};
  let allIndicesMaxxed = false;
  let newData = [];
  let i = 0;

  while (!allIndicesMaxxed) {
    let minDelay = Number.MAX_SAFE_INTEGER;
    let minName: string = "";

    for (const name in jsonDictionary) {
      const data = jsonDictionary[name][filename];

      if (name in indices) {
        if (indices[name] < data.length && data[indices[name]] === 0)
          indices[name]++;
      } else {
        indices[name] = 0;
        characterIdentifiers[name] = i++;
      }

      if (indices[name] >= data.length) continue;

      if (
        indices[name] == 0 ||
        data[indices[name] - 1] != clientAppSettings.commands.delay
      ) {
        while (
          indices[name] < data.length &&
          (data[indices[name]] != clientAppSettings.commands.delay ||
            indices[name] % 2 != 0)
        ) {
          if (indices[name] % 2 == 0)
            data[indices[name]] += characterIdentifiers[name];
          newData.push(data[indices[name]]);
          indices[name]++;
        }

        if (indices[name] >= data.length) continue;
        indices[name]++;
      }

      const delay = data[indices[name]];
      if (delay < minDelay) {
        [minDelay, minName] = [delay, name];
      }
    }

    if (minDelay == 0) continue;
    if (minName !== "") {
      newData.push(clientAppSettings.commands.delay);
      newData.push(jsonDictionary[minName][filename][indices[minName]]);
      for (const name in jsonDictionary) {
        const data = jsonDictionary[name][filename];
        if (indices[name] < data.length)
          jsonDictionary[name][filename][indices[name]] -=
            newData[newData.length - 1];
      }
    } else allIndicesMaxxed = true;
  }

  for (const [i, entry] of newData.entries()) {
    if (i % 2 == 0 && entry in appSettings.commandAliases)
      newData[i] =
        appSettings.commandAliases[
          entry as keyof typeof appSettings.commandAliases
        ];
    else newData[i] = newData[i].toString();
  }

  console.log(newData);
  return newData;
};

export const postUpload = (req: Request, res: Response) => {
  const filename = req.body.filename;

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
        // for (let i = 1; i <= 100; i ++ ) {
        //   const formattedNum = String(i).padStart(3, '0');
        //   const filename = `${formattedNum}.wav`;
        //   syncLocal(mergeAllData(filename, jsonDictionary), filename);
        // }
        upload(res, mergeAllData(filename, jsonDictionary), filename);
        // res.send("OK");
      } catch {
        console.log(appSettings.jsonParseErrorMessage, err);
        return res.status(400).send(appSettings.jsonParseErrorMessage);
      }
    }
  );
};


