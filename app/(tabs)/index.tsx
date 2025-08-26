import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { UserProvider, useUser } from '../../context/UserContext';
import { DatabaseProvider } from '../../context/DatabaseContext';
import LoginScreen from '../LoginScreen';
import MainTabNavigator from '../../navigation/MainTabNavigator';
import { theme } from '../../theme/theme';

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
        </PaperProvider>
      </UserProvider>
    </DatabaseProvider>
  );
}