import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  DrawerRouter,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Drawer } from "expo-router/drawer";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from "@/components/useColorScheme";

export {
  ErrorBoundary,
} from "expo-router";

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
        <Drawer>
          <Drawer.Screen
            name="(tabs)/index"
            options={{
              drawerLabel: 'Home',
              title: 'Overview',
            }}
          />
          <Drawer.Screen
            name="Performance" 
            options={{
              drawerLabel: 'Performance',
              title: 'Performance',
            }}
          />
          <Drawer.Screen
            name="Fees"
            options={{
              drawerLabel: 'Fees',
              title: 'Fees',
            }}
          />
          <Drawer.Screen
            name="Attendance" 
            options={{
              drawerLabel: 'Attendance',
              title: 'Attendance',
            }}
          />
          <Drawer.Screen
            name="Settings" 
            options={{
              drawerLabel: 'Settings',
              title: 'Settings',
            }}
          />
          {/*
          <Drawer.Screen
            name="Login" // This is the name of the page and must match the url from root
            options={{
              drawerLabel: '',
              title: 'Login',
              
            }}
          />
          */}
        </Drawer>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}