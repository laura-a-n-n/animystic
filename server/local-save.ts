import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { appSettings } from "./constants";
import { DataRequestBody } from "./types";

function generateTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/:/g, "-");
}

export const postData = async (req: Request, res: Response) => {
  // extract and verify data
  const body: DataRequestBody = req.body;
  if (!("name" in body && "filename" in body && "data" in body))
    return res.status(400).send(appSettings.invalidDataMessage);
  const data = body.data;

  // verify that the request body is an array of numbers
  if (!Array.isArray(data) || !data.every((n) => typeof n === "number")) {
    return res.status(400).send(appSettings.invalidDataMessage);
  }

  // update the JSON dictionary with the received data
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
        jsonDictionary[body.name] = jsonDictionary[body.name] || {};
        jsonDictionary[body.name][body.filename] = data;
        fs.writeFile(
          appSettings.localDataInputPath,
          JSON.stringify(jsonDictionary),
          (err) => {
            if (err) {
              console.log(appSettings.writeErrorMessage, err);
              return res.status(500).send(appSettings.serverErrorMessage);
            }
            console.log(appSettings.dataSaveSuccessMessage);

            // Save a backup copy of the data
            const backupFilename = `${generateTimestamp()}.json`;
            const backupFilePath = path.join(
              appSettings.localDataBackupFolderPath,
              backupFilename
            );
            fs.writeFile(
              backupFilePath,
              JSON.stringify(jsonDictionary),
              (err) => {
                if (err) {
                  console.log(err);
                }
                console.log(`Backup saved to ${backupFilePath}`);
              }
            );

            res.send(appSettings.dataLocalSaveCompleteMessage);
          }
        );
      } catch (err) {
        console.log(appSettings.jsonParseErrorMessage, err);
        return res.status(400).send(appSettings.invalidDataMessage);
      }
    }
  );
};
