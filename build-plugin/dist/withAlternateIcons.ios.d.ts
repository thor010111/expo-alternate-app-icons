import { ConfigPlugin } from "expo/config-plugins";
import { AlternateAppIcon } from "./alternateAppIcon";
declare const withAlternateIconsIos: ConfigPlugin<AlternateAppIcon[]>;
export declare const createIOSAppIcon: (projectRoot: string, alternateAppIcon: AlternateAppIcon) => Promise<void>;
export default withAlternateIconsIos;
