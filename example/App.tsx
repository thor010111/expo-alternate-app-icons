import * as ExpoAlternateAppIcons from "expo-alternate-app-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function App() {
  const [currentIconName, setCurrentIconName] = useState("default");

  useEffect(() => {
    ExpoAlternateAppIcons.getCurrentAlternateAppIconName().then((iconName) =>
      setCurrentIconName(iconName ?? "default")
    );
  }, []);

  const switchIcon = async (iconName: string | null) => {
    await ExpoAlternateAppIcons.setAlternateAppIcon(iconName);

    const currentIconName =
      await ExpoAlternateAppIcons.getCurrentAlternateAppIconName();
    setCurrentIconName(currentIconName ?? "default");
  };

  return (
    <View style={styles.container}>
      <Text>{currentIconName}</Text>

      <TouchableOpacity onPress={() => switchIcon("red")}>
        <Text>Red icon</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => switchIcon("blue")}>
        <Text>Blue icon</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => switchIcon("green")}>
        <Text>Green icon</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => switchIcon(null)}>
        <Text>Default</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
