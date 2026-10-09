import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import ErrorBox from '../components/ErrorBox';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { cardStyle, colors } from '../theme';

const CARDS = [
  { key: 'totalProjects', label: 'Total Projects' },
  { key: 'totalTasks', label: 'Total Tasks' },
  { key: 'completedTasks', label: 'Completed Tasks' },
  { key: 'pendingTasks', label: 'Pending Tasks' },
  { key: 'projectsInProgress', label: 'Projects In Progress' },
];

export default function DashboardScreen() {
  const { data, loading, error, reload } = useApi(() => api.getDashboard(), []);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <ErrorBox error={error} onRetry={reload} />
        {loading && !data && <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />}
        {data && (
          <View style={styles.grid}>
            {CARDS.map((c) => (
              <View key={c.key} style={[cardStyle, styles.card]}>
                <Text style={styles.value}>{data.data[c.key]}</Text>
                <Text style={styles.label}>{c.label}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, flexGrow: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47.5%' },
  value: { fontSize: 32, fontWeight: '700', color: colors.primary },
  label: { fontSize: 14, color: colors.muted, marginTop: 2 },
});
