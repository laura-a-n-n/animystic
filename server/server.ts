import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import path from "path";
import { spawn } from "child_process";

import { appSettings } from "./constants";
import { DataRequestBody } from "./types";
import { filenameToNumber } from "../common/utils";
import { Response } from "express-serve-static-core";

const app = express();

// serve static assets from the public directory
app.use(express.static("public"));
app.use("/assets", express.static("assets"));
app.use(bodyParser.json());

app.listen(8080, () => {
  console.log("Server listening on port 8080");
});

app.get("/files", async (req, res) => {
  let dict: { [key: string]: Array<string> } = {};
  try {
    const readdirPromises = Object.entries(appSettings.assetDirectories).map(
      async ([key, directory]) => {
        const files = await fs.promises.readdir(directory);
        dict[key] = files;
      }
    );
    await Promise.all(readdirPromises);
    res.send(dict);
  } catch (err) {
    res.send(500);
  }
});

app.post("/data", (req, res) => {
  // extract and verify data
  const body: DataRequestBody = req.body;
  if (!("name" in body && "filename" in body && "data" in body)) return;
  const data = body.data;

  // verify that the request body is an array of numbers
  if (!Array.isArray(data) || !data.every((n) => typeof n === "number")) {
    return res.status(400).send("Invalid data");
  }

  // update the JSON dictionary with the received data
  fs.readFile(appSettings.localDataInputPath, "utf8", (err, jsonString) => {
    if (err) {
      console.log("Error reading file from disk:", err);
      return res.status(500).send("Server error");
    }
    try {
      const jsonDictionary = JSON.parse(jsonString);
      jsonDictionary[body.name] = jsonDictionary[body.name] || {};
      jsonDictionary[body.name][body.filename] = data;
      fs.writeFile(
        appSettings.localDataInputPath,
        JSON.stringify(jsonDictionary),
        (err) => {
          if (err) {
            console.log("Error writing file:", err);
            return res.status(500).send("Server error");
          }
          console.log("Data saved successfully!");
          res.send("Received data and saved it successfully");
        }
      );
    } catch (err) {
      console.log("Error parsing JSON string:", err);
      return res.status(400).send("Invalid data");
    }
  });
});

const upload = (
  res: Response<any, Record<string, any>, number>,
  data: number[],
  filename: string
) => {
  const fileContents = fs.readFileSync(appSettings.dataInputPath, "utf8");
  // extract the vector from the file
  const regex = appSettings.dataRegex;
  const matches = fileContents.match(regex);

  if (matches) {
    const commands = matches.map((match) =>
      match
        .trim()
        .slice(1, -1)
        .split(",")
        .map((str) => parseInt(str.trim()))
    );

    // update the vector at the given index
    const index = filenameToNumber(filename) - 1;
    commands[index] = data;

    // construct new file contents
    const newCommands = commands.map((command) => `{ ${command.join(", ")} }`);
    const startString = appSettings.dataInputSearchString;
    const startIndex = fileContents.indexOf(startString);
    const endIndex =
      fileContents.indexOf(appSettings.dataInputStopString, startIndex) + 2;
    const newFileContents =
      fileContents.slice(0, startIndex + startString.length - 1) +
      "{\n" +
      newCommands.join(",\n") +
      "\n};\n\n" +
      fileContents.slice(endIndex);

    // write new contents to file
    fs.writeFileSync(appSettings.dataInputPath, newFileContents, "utf8");

    // call batch files
    const spawner = (currentBatchFileIndex: number = 0) => {
      const batchFile = appSettings.uploadBatchFiles[currentBatchFileIndex];
      console.log(`Script ${currentBatchFileIndex}: ${batchFile}`);
      const bat = spawn("cmd.exe", ["/c", batchFile]);

      bat.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
        if (currentBatchFileIndex == appSettings.uploadBatchFiles.length - 1)
          bat.kill();
      });

      bat.stderr.on("data", (data) => {
        console.log(`stderr: ${data}`);
      });

      bat.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
        currentBatchFileIndex++;
        if (currentBatchFileIndex < appSettings.uploadBatchFiles.length)
          spawner(currentBatchFileIndex);
        else res.send("OK");
      });
    };
    spawner();

    return true;
  } else return res.status(400).send("Could not upload");
};

// assuming the client sends the input in the request body as a JSON object
app.post("/upload", (req, res) => {
  const name = req.body.name;
  const filename = req.body.filename;

  // get the local data
  let data: number[] = [];
  fs.readFile(appSettings.localDataInputPath, "utf8", (err, jsonString) => {
    if (err) {
      console.log("Error reading file from disk:", err);
      return res.status(500).send("Server error");
    }
    try {
      const jsonDictionary = JSON.parse(jsonString);
      if (!(name in jsonDictionary && filename in jsonDictionary[name]))
        return res.status(400).send("Invalid client input!");
      data = jsonDictionary[name][filename];
      upload(res, data, filename);
    } catch {
      console.log("Error parsing data JSON:", err);
      return res.status(400).send("Invalid data");
    }
  });
});
