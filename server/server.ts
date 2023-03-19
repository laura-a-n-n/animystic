import express from "express";
import fs from "fs";
import bodyParser from "body-parser";

import { appSettings } from "./constants";
import { DataRequestBody } from "./types";

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
        const readdirPromises = Object.entries(
            appSettings.assetDirectories
        ).map(async ([key, directory]) => {
            const files = await fs.promises.readdir(directory);
            dict[key] = files;
        });
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
    fs.readFile("./data/data.json", "utf8", (err, jsonString) => {
      if (err) {
          console.log("Error reading file from disk:", err);
          return res.status(500).send("Server error");
      }
      try {
          const jsonDictionary = JSON.parse(jsonString);
          jsonDictionary[body.name] = jsonDictionary[body.name] || {};
          jsonDictionary[body.name][body.filename] = data;
          fs.writeFile(
              "./data/data.json",
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
