import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

// A row of tappable options. Pass `allLabel` to add an "All" option with value ''.
export default function ChipSelect({ options, value, onChange, allLabel }) {
  const items = allLabel ? [{ value: '', label: allLabel }, ...options] : options;
  return (
    <View style={styles.row}>
      {items.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value || 'all'}
            onPress={() => onChange(o.value)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.text, selected && styles.textSelected]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff' },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 13, color: colors.text },
  textSelected: { color: '#fff', fontWeight: '600' },
});
