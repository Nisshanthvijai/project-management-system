import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import Screen from '../components/Screen';
import Button from '../components/Button';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import TaskFormScreen from '../screens/TaskFormScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  const { logout } = useAuth();
  const confirmLogout = () =>
    Alert.alert('Log out', 'Do you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerRight: () => (
          <Pressable onPress={confirmLogout} style={{ marginRight: 16 }}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Log out</Text>
          </Pressable>
        ),
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 18 }}>📊</Text> }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 18 }}>📁</Text> }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading, bootError, boot } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Loading...</Text>
      </View>
    );
  }

  // Could not reach the server on app start (e.g. no internet): let the user retry.
  if (bootError) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.errorText}>{bootError}</Text>
          <Button title="Try again" onPress={boot} style={{ marginTop: 16 }} />
        </View>
      </Screen>
    );
  }

  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen name="Home" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="ProjectDetail"
            component={ProjectDetailScreen}
            options={({ route }) => ({ title: route.params?.name || 'Project' })}
          />
          <Stack.Screen name="TaskForm" component={TaskFormScreen} options={{ title: 'Task' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  muted: { color: colors.muted, marginTop: 12 },
  errorText: { color: colors.danger, textAlign: 'center', fontSize: 15 },
});
