import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { UserProvider } from './src/context/UserContext';
import { DatabaseProvider } from './src/context/DatabaseContext';
import LoginScreen from './src/screens/LoginScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import { useUser } from './src/context/UserContext';
import { theme } from './src/theme/theme';

const Stack = createStackNavigator();

function AppContent() {
  const { isAuthenticated } = useUser();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <DatabaseProvider>
      <UserProvider>
        <PaperProvider theme={theme}>
          <AppContent />
          <StatusBar style="light" />
        </PaperProvider>
      </UserProvider>
    </DatabaseProvider>
  );
}