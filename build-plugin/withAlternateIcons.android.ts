import { dpiValues } from "@expo/prebuild-config/build/plugins/icons/withAndroidIcons";
import {
  ConfigPlugin,
  withAndroidManifest,
  AndroidConfig,
  withDangerousMod,
} from "expo/config-plugins";
import fs from "fs-extra";
import { join } from "path";
import sharp from "sharp";

import { AlternateAppIcon } from "./alternateAppIcon";
import { createResizedImage } from "./create-resized-image";

const DEFAULT_APP_ICON_NAME = "ic_launcher";
const REQUIRED_APP_ICON_SIZE = 1024;

const withAlternateIconsAndroid: ConfigPlugin<AlternateAppIcon[]> = (
  config,
  alternateIcons
) => {
  let androidConfig = withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults
    );

    const mainApplicaitonEntry = mainApplication as any;

    // remove default launcher icon
    delete mainApplicaitonEntry["activity"][0]["intent-filter"][0]["category"];

    // add default launcher icon as activity-aliases
    mainApplicaitonEntry["activity-alias"] = [
      ...[
        { name: DEFAULT_APP_ICON_NAME } as AlternateAppIcon,
        ...alternateIcons,
      ].map((ai) => ({
        $: {
          "android:name": `.MainActivity_${ai.name}`,
          "android:enabled":
            ai.name === DEFAULT_APP_ICON_NAME ? "true" : "false",
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
            ],
          },
        ],
      })),
    ];

    return config;
  });

  androidConfig = withDangerousMod(androidConfig, [
    "android",
    async (config) => {
      for (const alternateIcon of alternateIcons) {
        await createAndroidAppIcon(
          config.modRequest.projectRoot,
          alternateIcon
        );
      }

      return config;
    },
  ]);

  return androidConfig;
};

export default withAlternateIconsAndroid;

type DPIString = "mdpi" | "hdpi" | "xhdpi" | "xxhdpi" | "xxxhdpi";
type dpiMap = Record<
  DPIString,
  {
    folderName: string;
    scale: number;
  }
>;

const BASE_SIZE = 48;

export const createAndroidAppIcon = async (
  projectRoot: string,
  alternateIcon: AlternateAppIcon
) => {
  const alternateIconMetadata = await sharp(alternateIcon.icon).metadata();

  if (
    alternateIconMetadata.width !== REQUIRED_APP_ICON_SIZE ||
    alternateIconMetadata.height !== REQUIRED_APP_ICON_SIZE
  )
    throw new Error(
      `Icon must be ${REQUIRED_APP_ICON_SIZE}x${REQUIRED_APP_ICON_SIZE} pixels.`
    );

  for (const dpiMapKey of Object.keys(dpiValues as dpiMap) as DPIString[]) {
    const dpiValue = dpiValues[dpiMapKey];
    const iconSizePx = Math.floor(BASE_SIZE * dpiValue.scale);

    const androidResPath = getAndroidResPath(projectRoot);
    const assetFolderPath = join(androidResPath, `${dpiValue.folderName}`);
    await fs.ensureDir(androidResPath);

    await createResizedImage(
      alternateIcon.icon,
      iconSizePx,
      false,
      alternateIcon.backgroundColor,
      join(assetFolderPath, `${alternateIcon.name}.png`)
    );

    await createResizedImage(
      alternateIcon.icon,
      iconSizePx,
      true,
      alternateIcon.backgroundColor,
      join(assetFolderPath, `${alternateIcon.name}_round.png`)
    );
  }
};

const getAndroidResPath = (projectRoot: string): string => {
  return join(projectRoot, "android", "app", "src", "main", "res");
};
