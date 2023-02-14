import { ConfigPlugin } from "expo/config-plugins";

import { AlternateAppIcon } from "./alternateAppIcon";
import withAlternateIconsAndroid from "./withAlternateIcons.android";
import withAlternateIconsIos from "./withAlternateIcons.ios";

export const withDynamicIcons: ConfigPlugin<AlternateAppIcon[]> = (
  config,
  alternateIcons
) => {
  let pluginConfig = withAlternateIconsIos(config, alternateIcons);
  pluginConfig = withAlternateIconsAndroid(config, alternateIcons);

  return pluginConfig;
};

export default withDynamicIcons;
