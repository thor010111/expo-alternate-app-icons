import ExpoAlternateAppIconsModule from "./ExpoAlternateAppIconsModule";

export async function setAlternateAppIcon(
  iconName: string | null
): Promise<void> {
  return await ExpoAlternateAppIconsModule.setAlternateAppIcon(iconName);
}

export async function getCurrentAlternateAppIconName(): Promise<string | null> {
  return await ExpoAlternateAppIconsModule.getCurrentAlternateAppIconName();
}
