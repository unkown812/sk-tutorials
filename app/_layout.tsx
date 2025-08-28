import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Drawer } from "expo-router/drawer";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "@/components/useColorScheme";
import { Image, Text, View, StyleSheet } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider>
          <Drawer
            screenOptions={{
              header: () => (
                <View style={styles.drawerHeader}>
                  <Image
                    source={require("../assets/images/logo.png")}
                    style={styles.drawerIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.drawerTitle}>SK Tutorials</Text>
                </View>
              ),
            }}
          >
            <Drawer.Screen
              name="DashboardScreen"
              options={{
                drawerLabel: "DashBoard",
                title: "DashBoard",
              }}
            />
            <Drawer.Screen
              name="StudentsScreen"
              options={{
                drawerLabel: "Students",
                title: "Students",
              }}
            />
            <Drawer.Screen
              name="FeesScreen"
              options={{
                drawerLabel: "Fees",
                title: "Fees",
              }}
            />
            <Drawer.Screen
              name="PerformanceScreen"
              options={{
                drawerLabel: "Performance",
                title: "Performance",
              }}
            />
            <Drawer.Screen
              name="AttendanceScreen"
              options={{
                drawerLabel: "Attendance",
                title: "Attendance",
              }}
            />
            <Drawer.Screen
              name="SettingsScreen"
              options={{
                drawerLabel: "Settings",
                title: "Settings",
              }}
            />
          </Drawer>
        </PaperProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  drawerIcon: {
    width: 64,
    height: 64,
    marginBottom: 10,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
