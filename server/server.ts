import express from "express";
import fs from "fs";
import { appSettings } from "./constants";

const app = express();

// Serve static assets from the public directory
app.use(express.static("public"));
app.use("/assets", express.static("assets"));

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
