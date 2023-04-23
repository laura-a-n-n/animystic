import fs from "fs";
import { assert, expect } from "chai";
import {
  appSettings,
  appSettings as serverAppSettings,
} from "server/constants";
import { appSettings as clientAppSettings } from "@/constants";

import { getAudioDurationInSeconds } from "get-audio-duration";

describe("Asset directories", () => {
  const assetDirectories = serverAppSettings.assetDirectories;

  for (const [dirName, dirPath] of Object.entries(assetDirectories)) {
    describe(`${dirName} directory`, () => {
      it("should exist", () => {
        expect(fs.existsSync(dirPath)).to.be.true;
      });

      it("should be a directory", () => {
        const stats = fs.statSync(dirPath);
        expect(stats.isDirectory()).to.be.true;
      });

      it("should not be empty", () => {
        const files = fs.readdirSync(dirPath);
        expect(files.length).to.be.greaterThan(0);
      });
    });
  }
});

describe("Signal input data", () => {
  const filePath = serverAppSettings.localDataInputPath;
  const fileContents = fs.readFileSync(filePath);
  let data: { [character: string]: { [filename: string]: number[] } } = {};
  let oldData: typeof data = {};
  let sumCheckSucceeded: boolean = true;

  before(() => {
    expect(fs.existsSync(filePath)).to.be.true;
    expect(fileContents).to.not.be.undefined;

    const contentsString = fileContents.toString();
    data = JSON.parse(contentsString);
    oldData = JSON.parse(contentsString);
    expect(data).to.not.be.undefined;
    console.log(
      "Please be patient, these tests may take a while for large input data...."
    );
  });

  it("should contain non-empty arrays", function () {
    for (const character in data) {
      for (const filename in data[character]) {
        const soundPath = `${serverAppSettings.assetDirectories.sound}/${filename}`;
        if (!fs.existsSync(soundPath)) continue;
        const array = data[character][filename];
        expect(array).to.be.an("Array");
        expect(array).to.not.be.empty;
      }
    }
  });

  it("should respect sound durations", async function () {
    this.timeout(0); // this may take a while...
    const differences = [];

    for (const character in data) {
      for (const filename in data[character]) {
        const array = data[character][filename];
        const soundPath = `${serverAppSettings.assetDirectories.sound}/${filename}`;
        try {
          await fs.promises.access(soundPath, fs.constants.F_OK);
        } catch (err) {
          // console.log(`Warning: ${soundPath} does not exist.`);
          continue;
        }
        const soundDurationInMs = Math.round(
          (await getAudioDurationInSeconds(soundPath)) * 1000
        );

        let sum = 0;
        for (let i = 0; i < array.length; i += 2) {
          if (array[i] == clientAppSettings.commands.delay) {
            sum += array[i + 1];
          }
        }

        const diff = soundDurationInMs - sum;

        if (diff < 0) {
          if (
            diff < -array[array.length - 1] ||
            array[array.length - 2] != clientAppSettings.commands.delay
          )
            console.log(`Cannot fix ${filename}`);
          expect(array[array.length - 2]).to.equal(
            clientAppSettings.commands.delay
          );
          expect(diff).to.be.greaterThanOrEqual(-array[array.length - 1]);
          array[array.length - 1] += diff;
        }
        if (diff > 0) {
          const characterSettings =
            clientAppSettings.characters[
              character as keyof typeof clientAppSettings.characters
            ];
          array.push(
            clientAppSettings.commands.talk,
            characterSettings.rangeInverted
              ? characterSettings.angularRange
              : 0,
            clientAppSettings.commands.delay,
            diff
          );
        }
        if (diff != 0)
          differences.push({ character, filename, difference: diff });
      }
    }

    // Write differences to JSON file
    if (differences.length > 0) {
      sumCheckSucceeded = false;
      await fs.promises.writeFile(
        "tests/logs/differences.json",
        JSON.stringify(differences, null, 2)
      );
      await fs.promises.writeFile(
        "tests/logs/data-backup.json",
        JSON.stringify(oldData, null, 2)
      );
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`${differences.length} entries fixed`);
    }

    expect(differences.length).to.equal(0);

    return Promise.resolve();
  });

  it("should respect sound durations after first check", async function () {
    if (sumCheckSucceeded) return Promise.resolve();
    data = JSON.parse((await fs.promises.readFile(filePath)).toString());

    this.timeout(Number.MAX_SAFE_INTEGER);
    // Assert the sum of the delays is close to soundDurationInMs
    for (const character in data) {
      for (const filename in data[character]) {
        const array = data[character][filename];
        const soundPath = `${serverAppSettings.assetDirectories.sound}/${filename}`;
        try {
          await fs.promises.access(soundPath, fs.constants.F_OK);
        } catch (err) {
          // console.log(`Warning: ${soundPath} does not exist.`);
          continue;
        }
        const soundDurationInMs = Math.round(
          (await getAudioDurationInSeconds(soundPath)) * 1000
        );

        let sum = 0;
        for (let i = 0; i < array.length; i += 2) {
          if (array[i] == clientAppSettings.commands.delay) sum += array[i + 1];
        }

        expect(sum).to.equal(soundDurationInMs);
      }
    }
    Promise.resolve();
  });

  it("should not contain any duplicate commands", async () => {
    let duplicates = 0;
    for (const character in data) {
      for (const filename in data[character]) {
        const array = data[character][filename];
        for (let i = 0; i < array.length; i += 2) {
          if (
            (i < array.length - 2 && array[i] == array[i + 2]) ||
            (array[i] == clientAppSettings.commands.delay && array[i + 1] == 0)
          ) {
            array.splice(i, 2);
            i -= 2;
            duplicates++;
          }
        }
      }
    }
    if (duplicates > 0) {
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`${duplicates} duplicates resolved`);
    }
    expect(duplicates).to.equal(0);
    Promise.resolve();
  });
});
