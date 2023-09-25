import { IOSConfig, withDangerousMod, ConfigPlugin, withXcodeProject } from "@expo/config-plugins";

import { ContentsJson, writeContentsJsonAsync } from '@expo/prebuild-config/build/plugins/icons/AssetContents'

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
        await createIOSAppIcon(config.modRequest.projectRoot, alternateIcon);
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
  alternateAppIcon: AlternateAppIcon
) => {
  const iosNamedProjectRoot = getIosNamedProjectPath(projectRoot);

  const imageSetPath = `Images.xcassets/${alternateAppIcon.name}.appiconset`;
  await fs.ensureDir(join(iosNamedProjectRoot, imageSetPath));

  const imagesJson: ContentsJson["images"] = [];
  const generatedIcons: Record<string, boolean> = {};

  const size = 1024;
  const scale = 1
  const filename = getAppleIconName(alternateAppIcon.name, size, 1);

  if (!(filename in generatedIcons)) {
    const iconSizePx = size * scale;

    await createResizedImage(
      alternateAppIcon.icon,
      iconSizePx,
      false,
      alternateAppIcon.backgroundColor,
      join(iosNamedProjectRoot, imageSetPath, filename)
    );
  }

  imagesJson.push({
    idiom: 'universal',
    platform: 'ios',
    filename,    
     size: `${size}x${size}`,
  });

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
