"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndroidAppIcon = void 0;
const withAndroidIcons_1 = require("@expo/prebuild-config/build/plugins/icons/withAndroidIcons");
const config_plugins_1 = require("@expo/config-plugins");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = require("path");
const sharp_1 = __importDefault(require("sharp"));
const create_resized_image_1 = require("./create-resized-image");
const DEFAULT_APP_ICON = {
    name: "ic_launcher",
};
const REQUIRED_APP_ICON_SIZE = 1024;
const withAlternateIconsAndroid = (config, alternateIcons) => {
    let androidConfig = (0, config_plugins_1.withAndroidManifest)(config, (config) => {
        const mainApplication = config_plugins_1.AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
        const mainApplicaitonEntry = mainApplication;
        delete mainApplicaitonEntry["activity"][0]["intent-filter"][0]["category"];
        // add default launcher icon as activity-aliases
        mainApplicaitonEntry["activity-alias"] = [
            ...[DEFAULT_APP_ICON, ...alternateIcons].map((ai) => ({
                $: {
                    "android:name": `.MainActivity_${ai.name}`,
                    "android:enabled": ai === DEFAULT_APP_ICON ? "true" : "false",
                    "android:icon": `@mipmap/${ai.name}`,
                    "android:roundIcon": `@mipmap/${ai.name}_round`,
                    "android:targetActivity": ".MainActivity",
                    "android:exported": "true",
                },
                "intent-filter": [
                    {
                        action: [{ $: { "android:name": "android.intent.action.MAIN" } }],
                        category: [
                            { $: { "android:name": "android.intent.category.LAUNCHER" } },
                            { $: { "android:name": "android.intent.category.DEFAULT" } },
                        ],
                    },
                ],
            })),
        ];
        return config;
    });
    androidConfig = (0, config_plugins_1.withDangerousMod)(androidConfig, [
        "android",
        async (config) => {
            for (const alternateIcon of alternateIcons) {
                await (0, exports.createAndroidAppIcon)(config.modRequest.projectRoot, alternateIcon);
            }
            return config;
        },
    ]);
    return androidConfig;
};
exports.default = withAlternateIconsAndroid;
const BASE_SIZE = 48;
const createAndroidAppIcon = async (projectRoot, alternateIcon) => {
    const alternateIconMetadata = await (0, sharp_1.default)(alternateIcon.icon).metadata();
    if (alternateIconMetadata.width !== REQUIRED_APP_ICON_SIZE ||
        alternateIconMetadata.height !== REQUIRED_APP_ICON_SIZE)
        throw new Error(`Icon must be ${REQUIRED_APP_ICON_SIZE}x${REQUIRED_APP_ICON_SIZE} pixels.`);
    for (const dpiMapKey of Object.keys(withAndroidIcons_1.dpiValues)) {
        const dpiValue = withAndroidIcons_1.dpiValues[dpiMapKey];
        const iconSizePx = Math.floor(BASE_SIZE * dpiValue.scale);
        const androidResPath = getAndroidResPath(projectRoot);
        const assetFolderPath = (0, path_1.join)(androidResPath, `${dpiValue.folderName}`);
        await fs_extra_1.default.ensureDir(androidResPath);
        await (0, create_resized_image_1.createResizedImage)(alternateIcon.icon, iconSizePx, false, alternateIcon.backgroundColor, (0, path_1.join)(assetFolderPath, `${alternateIcon.name}.png`));
        await (0, create_resized_image_1.createResizedImage)(alternateIcon.icon, iconSizePx, true, alternateIcon.backgroundColor, (0, path_1.join)(assetFolderPath, `${alternateIcon.name}_round.png`));
    }
};
exports.createAndroidAppIcon = createAndroidAppIcon;
const getAndroidResPath = (projectRoot) => {
    return (0, path_1.join)(projectRoot, "android", "app", "src", "main", "res");
};
