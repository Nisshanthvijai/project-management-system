import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import ErrorBox from '../components/ErrorBox';
import Badge from '../components/Badge';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { PROJECT_STATUSES, labelFor } from '../lib/constants';
import { formatDate } from '../lib/format';
import { cardStyle, colors } from '../theme';

export default function ProjectsScreen({ navigation }) {
  const { data, loading, error, reload } = useApi(() => api.getProjects({ limit: 100 }), []);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  return (
    <Screen>
      <FlatList
        data={data?.data ?? []}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={<ErrorBox error={error} onRetry={reload} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : !error ? (
            <Text style={styles.empty}>No projects yet. Create one on the web app and pull down to refresh.</Text>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item: p }) => (
          <Pressable
            style={cardStyle}
            onPress={() => navigation.navigate('ProjectDetail', { projectId: p.id, name: p.name })}
          >
            <View style={styles.row}>
              <Text style={styles.name}>{p.name}</Text>
              <Badge value={p.status} label={labelFor(PROJECT_STATUSES, p.status)} />
            </View>
            {p.description ? <Text style={styles.desc}>{p.description}</Text> : null}
            <Text style={styles.meta}>
              {formatDate(p.startDate)} → {formatDate(p.endDate)} · {p._count.tasks} task(s)
            </Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, flexGrow: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  name: { flex: 1, fontSize: 17, fontWeight: '600', color: colors.text },
  desc: { color: colors.muted, marginTop: 4 },
  meta: { color: colors.muted, fontSize: 13, marginTop: 8 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});
