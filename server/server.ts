import express from "express";
import bodyParser from "body-parser";

import { appSettings } from "./constants";
import { getFiles } from "./files";
import { postData } from "./local-save";
import { postUpload } from "./upload";

const app = express();

// serve static assets from the public directory
app.use(express.static("public"));
app.use("/assets", express.static("assets"));
app.use(bodyParser.json()); // use json parser

// open server
app.listen(appSettings.serverPort, () => {
  console.log(`Server listening on port ${appSettings.serverPort}`);
});

// http methods
app.get("/files", getFiles);
app.post("/data", postData);
app.post("/upload", postUpload);