import { getFilesAsync } from "@/utilities/file-helpers";
import { P5Singleton } from "@/utilities/p5-singleton";
import { appSettings } from "@/constants";
import data from "data.json";

const preloadAssets = async () => {
    const p = P5Singleton.getInstance();

    p.images = {};
    p.sounds = {};
    p.images.logo = p.loadImage(`${appSettings.imagesPath}/${appSettings.logo}`);
    p.images.missingImage = p.loadImage(`${appSettings.imagesPath}/${appSettings.missingImage}`);
    p.essentialImagesLoaded = true;
    
    const files = await getFilesAsync();
    p.files = files;
    files.image = files.contentImage.concat(files.specialImage);

    p.maxImages = files.image.length;
    p.maxSounds = files.sound.length;
    for (const f of files.sound) {
        p.sounds[f] = p.loadSound(
            `${appSettings.soundsPath}/${f}`,
            () => p.soundsLoaded++,
            () => p.maxSounds--
        );
    }
    for (const [index, f] of files.image.entries()) {
        p.images[f] = p.loadImage(
            `${(index < files.contentImage.length) ? appSettings.mainImagesPath : appSettings.specialImagesPath}/${f}`,
            () => p.imagesLoaded++,
            () => {
                p.maxImages--;
                p.images[f] = p.images.missingImage;
            }
        );
    }

    p.data = data;
};

export const preload = async () => {
    preloadAssets();
};
