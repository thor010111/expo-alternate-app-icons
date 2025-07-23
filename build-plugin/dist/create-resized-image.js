"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResizedImage = void 0;
const sharp_1 = __importDefault(require("sharp"));
const createResizedImage = async (iconPath, iconSizePx, round, backgroundColor, destination) => {
    let imageResizer = (0, sharp_1.default)(iconPath).resize(iconSizePx, iconSizePx);
    const composites = [];
    if (backgroundColor) {
        const background = Buffer.from(`<svg><rect x="0" y="0" width="${iconSizePx}" height="${iconSizePx}" fill="${backgroundColor}"/></svg>`);
        composites.push({
            input: background,
            blend: "dest-over",
        });
    }
    if (round) {
        const roundedCorners = Buffer.from(`<svg><rect x="0" y="0" width="${iconSizePx}" height="${iconSizePx}" rx="${iconSizePx * 0.5}" ry="${iconSizePx * 0.5}"/></svg>`);
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
exports.createResizedImage = createResizedImage;
