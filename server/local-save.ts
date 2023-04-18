import fs from "fs";
import { Request, Response } from "express";
import { appSettings } from "./constants";
import { DataRequestBody } from "./types";

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
