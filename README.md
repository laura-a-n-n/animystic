# Animystic Animation Editor (Alpha)
**Animystic** is an animation editor for servos. Zarbalatrax, the animatronic [fortune teller machine](https://en.wikipedia.org/wiki/Fortune_teller_machine), is programmed by and controlled with this software with the help with [Arduino](https://www.arduino.cc/) and [Raspberry Pi](https://www.raspberrypi.com/).

In particular, Zarbalatrax's jaw is a servo, and also Squambo the mouse, Zarbalatrax's friend, moves on a servo. For each outcome, there is a single audio file that plays, and the servos are timed to move accordingly.

While in early stages, Animystic can be used to:

 - generate serial, timed sequence data for a servo.
 - merge parallel data into a single serial sequence.
 - remotely upload to and interact with an endpoint on the local network.
 - organize audio files and their associated animations.

![animystic-screenshot](https://github.com/laura-a-n-n/animystic/assets/100505614/47d2c044-6edb-4037-9b4c-aaae66fda278)

While Animystic is in a usable state, a lot more needs to be done for all features to be usable by other people. That being said, here is a basic outline of how to use it in its current state.

## Basic use

Animystic uses Node.js. If you don't already have NPM installed, you can use [NVM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). There is [NVM for Windows](https://github.com/coreybutler/nvm-windows) for PC systems.

1. Download the repo.
2. Open a terminal and go to the folder location using `cd`, e.g. `cd C:\Users\me\animystic`.
3. Install by running `npm i`.
4. Run `npm run start`.
5. Open [localhost](http://localhost:8080) on port 8080.

That should work! To use all features, you should also have [Python](https://www.python.org/) installed on your system and added to your PATH environment variable.

Running `npm run test` runs tests and automatically tries to fix [data/data.json](data/data.json); it may be good to back this up before running. `npm run serve` is almost as good as `npm run start` except that (right now) saving won't work; this will be changed soon.

This repo doesn't come with any files to get started with the Arduino or Raspberry Pi as of yet. But if you do want to use the upload feature etc., the code currently uses SSH over the local network so you need an SSH key pair.

## Adding new animations

For each outcome, there is expected to be three items: a sound file (in `assets/sound`), an image file (in `assets/image`), and an animation (in `data/data.json`). Each of these should be associated with a unique key which is the same as the name of the sound file. The sound file naming format right now must be three-digit wav files, e.g. `087.wav`.

Be sure to edit the asset directories in [server/constants.ts](server/constants.ts) (the server app settings) if you don't want to use the default `zarbalatrax` folder in images, etc. Anything else you might want to change is in [src/constants.ts](src/constants.ts) (the client app settings). 

## Screenshots

![animystic-screenshot (1)](https://github.com/laura-a-n-n/animystic/assets/100505614/45f3cfa4-743f-48af-b840-a911e8bf5f27)
