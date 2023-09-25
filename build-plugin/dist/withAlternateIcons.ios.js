"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIOSAppIcon = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const AssetContents_1 = require("@expo/prebuild-config/build/plugins/icons/AssetContents");
const fs = __importStar(require("fs-extra"));
const path_1 = require("path");
const create_resized_image_1 = require("./create-resized-image");
const { getProjectName } = config_plugins_1.IOSConfig.XcodeUtils;
const withAlternateIconsIos = (config, alternateIcons) => {
    let iosConfig = (0, config_plugins_1.withDangerousMod)(config, [
        "ios",
        async (config) => {
            for (const alternateIcon of alternateIcons) {
                await (0, exports.createIOSAppIcon)(config.modRequest.projectRoot, alternateIcon);
            }
            return config;
        },
    ]);
    iosConfig = (0, config_plugins_1.withXcodeProject)(iosConfig, (cfg) => {
        const xcodeProject = cfg.modResults;
        xcodeProject.addBuildProperty("ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES", `"${alternateIcons.map((di) => di.name).join(" ")}"`);
        return cfg;
    });
    return iosConfig;
};
const createIOSAppIcon = async (projectRoot, alternateAppIcon) => {
    const iosNamedProjectRoot = getIosNamedProjectPath(projectRoot);
    const imageSetPath = `Images.xcassets/${alternateAppIcon.name}.appiconset`;
    await fs.ensureDir((0, path_1.join)(iosNamedProjectRoot, imageSetPath));
    const imagesJson = [];
    const generatedIcons = {};
    const size = 1024;
    const scale = 1;
    const filename = getAppleIconName(alternateAppIcon.name, size, 1);
    if (!(filename in generatedIcons)) {
        const iconSizePx = size * scale;
        await (0, create_resized_image_1.createResizedImage)(alternateAppIcon.icon, iconSizePx, false, alternateAppIcon.backgroundColor, (0, path_1.join)(iosNamedProjectRoot, imageSetPath, filename));
    }
    imagesJson.push({
        idiom: 'universal',
        platform: 'ios',
        filename,
        size: `${size}x${size}`,
    });
    await (0, AssetContents_1.writeContentsJsonAsync)((0, path_1.join)(iosNamedProjectRoot, imageSetPath), {
        images: imagesJson,
    });
};
exports.createIOSAppIcon = createIOSAppIcon;
const getIosNamedProjectPath = (projectRoot) => {
    const projectName = getProjectName(projectRoot);
    return (0, path_1.join)(projectRoot, "ios", projectName);
};
function getAppleIconName(iconName, size, scale) {
    return `${iconName}-${size}x${size}@${scale}x.png`;
}
exports.default = withAlternateIconsIos;
