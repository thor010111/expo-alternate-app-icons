import sharp from "sharp";

export const createResizedImage = async (
  iconPath: string,
  iconSizePx: number,
  round: boolean,
  backgroundColor: string | undefined,
  destination: string
) => {
  let imageResizer = sharp(iconPath).resize(iconSizePx, iconSizePx);

  const composites: sharp.OverlayOptions[] = [];

  if (backgroundColor) {
    const background = Buffer.from(
      `<svg><rect x="0" y="0" width="${iconSizePx}" height="${iconSizePx}" fill="${backgroundColor}"/></svg>`
    );

    composites.push({
      input: background,
      blend: "dest-over",
    });
  }

  if (round) {
    const roundedCorners = Buffer.from(
      `<svg><rect x="0" y="0" width="${iconSizePx}" height="${iconSizePx}" rx="${
        iconSizePx * 0.5
      }" ry="${iconSizePx * 0.5}"/></svg>`
    );

    composites.push({
      input: roundedCorners,
      blend: "dest-in",
    });
  }

  if (composites.length > 0) {
    imageResizer = imageResizer.composite(composites);
  }

  imageResizer.png().toFile(destination);
};
