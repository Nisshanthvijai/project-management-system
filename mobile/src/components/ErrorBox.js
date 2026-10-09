import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { errorText } from '../lib/format';

export default function ErrorBox({ error, onRetry }) {
  if (!error) return null;
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{typeof error === 'string' ? error : errorText(error)}</Text>
      {onRetry && (
        <Pressable onPress={onRetry}>
          <Text style={styles.retry}>Retry</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.dangerBg, borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#fecaca' },
  text: { color: colors.danger, fontSize: 14 },
  retry: { color: colors.danger, fontWeight: '700', marginTop: 6 },
});
