import { appSettings } from "@/constants";
import { P5Singleton } from "./p5-singleton"
import { SoundFile } from "p5";

export const newItem = (soundName: string) => {
  const p = P5Singleton.getInstance();

  // load assets
  const imageName = soundName.replace(".wav", ".png");
  // try {
    p.images[imageName] = p.loadImage(`${appSettings.imagesPath}/${imageName}`, () => p.imagesLoaded++, () => p.imagesLoaded++);
    p.files.image.push(imageName);
    p.maxSounds++;
    p.maxImages++;
    p.sounds[soundName] = p.loadSound(`${appSettings.soundsPath}/${soundName}`, () => p.soundsLoaded++, () => p.soundsLoaded++);
    p.files.sound.push(soundName);
    console.log(p.files)
  // } catch {
  //   console.log('tis ok')
  // }
}