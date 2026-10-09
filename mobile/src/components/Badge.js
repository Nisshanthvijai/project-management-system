import { StyleSheet, Text, View } from 'react-native';

const PALETTE = {
  NOT_STARTED: ['#f1f5f9', '#334155'],
  PENDING: ['#f1f5f9', '#334155'],
  IN_PROGRESS: ['#dbeafe', '#1d4ed8'],
  COMPLETED: ['#dcfce7', '#15803d'],
  LOW: ['#f1f5f9', '#334155'],
  MEDIUM: ['#fef3c7', '#b45309'],
  HIGH: ['#fee2e2', '#b91c1c'],
};

export default function Badge({ value, label }) {
  const [bg, fg] = PALETTE[value] || PALETTE.PENDING;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  text: { fontSize: 12, fontWeight: '600' },
});
