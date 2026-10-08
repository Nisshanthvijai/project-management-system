import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';

export default function Field({ label, error, multiline, containerStyle, ...props }) {
  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor="#94a3b8"
        style={[styles.input, multiline && styles.multiline, error && { borderColor: colors.danger }]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  multiline: { height: 90, textAlignVertical: 'top' },
  error: { color: colors.danger, fontSize: 13, marginTop: 4 },
});
