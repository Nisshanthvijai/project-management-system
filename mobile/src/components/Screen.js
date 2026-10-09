import { StyleSheet, Text, View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { colors } from '../theme';

// Wraps every screen: shows a banner when the phone has no internet connection.
export default function Screen({ children }) {
  const { isConnected } = useNetInfo();
  return (
    <View style={styles.container}>
      {isConnected === false && (
        <View style={styles.offline}>
          <Text style={styles.offlineText}>No internet connection. Changes need a connection.</Text>
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  offline: { backgroundColor: colors.danger, padding: 8 },
  offlineText: { color: '#fff', textAlign: 'center', fontSize: 13 },
});
