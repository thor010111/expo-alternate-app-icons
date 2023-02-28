import { ConfigPlugin } from "expo/config-plugins";
import { AlternateAppIcon } from "./alternateAppIcon";
declare const withAlternateIconsAndroid: ConfigPlugin<AlternateAppIcon[]>;
export default withAlternateIconsAndroid;
export declare const createAndroidAppIcon: (projectRoot: string, alternateIcon: AlternateAppIcon) => Promise<void>;
