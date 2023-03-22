import fs from "fs";
import { Response, Request } from "express";
import { appSettings } from "./constants";

export const getFiles = async (_: Request, res: Response) => {
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
  }