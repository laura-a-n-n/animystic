import { appSettings } from "@/constants";
import { isLoadFinished } from "@/main/preload";
import { P5Singleton } from "@/utilities/p5-singleton";

export const handleMessage = () => {
  const p = P5Singleton.getInstance();

  if (p.showMessage) {
    p.push();
    p.textAlign(p.CENTER);
    p.text(p.message, p.width / 2, p.height / 2);

    if (p.files !== undefined) {
      if (!isLoadFinished()) {
        p.percentLoaded =
          (appSettings.soundLoadingWeight * p.soundsLoaded +
            appSettings.imageLoadingWeight * p.imagesLoaded) /
          (appSettings.soundLoadingWeight * p.maxSounds +
            appSettings.imageLoadingWeight * p.maxImages);
        p.message = `Loading (${(p.percentLoaded * 100.0).toFixed(
          2
        )}%)...\nSounds loaded: ${p.soundsLoaded}/${
          p.maxSounds
        }\nImages loaded: ${p.imagesLoaded}/${p.maxImages}`;
      } else p.showMessage = false;
    }
    p.pop();
  }
};
