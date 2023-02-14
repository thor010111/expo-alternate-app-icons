import { IOSConfig, withDangerousMod } from "@expo/config-plugins";
import {
  ContentsJson,
  writeContentsJsonAsync,
} from "@expo/prebuild-config/build/plugins/icons/AssetContents";
import { ICON_CONTENTS } from "@expo/prebuild-config/build/plugins/icons/withIosIcons";
import { ConfigPlugin, withXcodeProject } from "expo/config-plugins";
import * as fs from "fs-extra";
import { join } from "path";

import { AlternateAppIcon } from "./alternateAppIcon";
import { createResizedImage } from "./create-resized-image";

const { getProjectName } = IOSConfig.XcodeUtils;

const withAlternateIconsIos: ConfigPlugin<AlternateAppIcon[]> = (
  config,
  alternateIcons
) => {
  let iosConfig = withDangerousMod(config, [
    "ios",
    async (config) => {
      for (const alternateIcon of alternateIcons) {
        await createIOSAppIcon(
          config.modRequest.projectRoot,
          alternateIcon.name,
          alternateIcon.icon
        );
      }

      return config;
    },
  ]);

  iosConfig = withXcodeProject(iosConfig, (cfg) => {
    const xcodeProject = cfg.modResults;

    xcodeProject.addBuildProperty(
      "ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES",
      `"${alternateIcons.map((di) => di.name).join(" ")}"`
    );

    return cfg;
  });

  return iosConfig;
};

export const createIOSAppIcon = async (
  projectRoot: string,
  iconName: string,
  iconPath: string
) => {
  const iosNamedProjectRoot = getIosNamedProjectPath(projectRoot);

  const imageSetPath = `Images.xcassets/${iconName}.appiconset`;
  await fs.ensureDir(join(iosNamedProjectRoot, imageSetPath));

  const imagesJson: ContentsJson["images"] = [];
  const generatedIcons: Record<string, boolean> = {};

  for (const platform of ICON_CONTENTS) {
    for (const { size, scales } of platform.sizes) {
      for (const scale of scales) {
        const filename = getAppleIconName(iconName, size, scale);

        if (!(filename in generatedIcons)) {
          const iconSizePx = size * scale;

          await createResizedImage(
            iconPath,
            iconSizePx,
            false,
            "#ffffff",
            join(iosNamedProjectRoot, imageSetPath, filename)
          );
        }

        imagesJson.push({
          idiom: platform.idiom,
          size: `${size}x${size}`,
          scale: `${scale}x`,
          filename,
        });
      }
    }
  }

  await writeContentsJsonAsync(join(iosNamedProjectRoot, imageSetPath), {
    images: imagesJson,
  });
};

const getIosNamedProjectPath = (projectRoot: string): string => {
  const projectName = getProjectName(projectRoot);
  return join(projectRoot, "ios", projectName);
};

function getAppleIconName(
  iconName: string,
  size: number,
  scale: number
): string {
  return `${iconName}-${size}x${size}@${scale}x.png`;
}

export default withAlternateIconsIos;
