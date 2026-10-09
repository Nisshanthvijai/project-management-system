import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../components/Screen';
import ErrorBox from '../components/ErrorBox';
import Badge from '../components/Badge';
import Button from '../components/Button';
import ChipSelect from '../components/ChipSelect';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { useDebounce } from '../hooks/useDebounce';
import { PRIORITIES, PROJECT_STATUSES, TASK_STATUSES, labelFor } from '../lib/constants';
import { errorText, formatDate } from '../lib/format';
import { cardStyle, colors } from '../theme';

export default function ProjectDetailScreen({ route, navigation }) {
  const { projectId } = route.params;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [actionError, setActionError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const debouncedSearch = useDebounce(search);

  const project = useApi(() => api.getProject(projectId), [projectId]);
  const tasks = useApi(
    () => api.getTasks({ projectId, search: debouncedSearch, status, priority, limit: 100 }),
    [projectId, debouncedSearch, status, priority],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([project.reload(), tasks.reload()]);
    setRefreshing(false);
  };

  const runAction = async (fn) => {
    setActionError('');
    try {
      await fn();
      await tasks.reload();
    } catch (err) {
      setActionError(errorText(err));
    }
  };

  const toggleComplete = (task) =>
    runAction(() => api.updateTask(task.id, { status: task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' }));

  const confirmDelete = (task) =>
    Alert.alert('Delete task', `Delete "${task.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => runAction(() => api.deleteTask(task.id)) },
    ]);

  const p = project.data?.data;

  const header = (
    <View>
      <ErrorBox error={project.error} onRetry={project.reload} />
      {p && (
        <View style={[cardStyle, { marginBottom: 16 }]}>
          <View style={styles.row}>
            <Text style={styles.projectName}>{p.name}</Text>
            <Badge value={p.status} label={labelFor(PROJECT_STATUSES, p.status)} />
          </View>
          {p.description ? <Text style={styles.desc}>{p.description}</Text> : null}
          <Text style={styles.meta}>
            {formatDate(p.startDate)} → {formatDate(p.endDate)}
          </Text>
        </View>
      )}

      <View style={[styles.row, { marginBottom: 10 }]}>
        <Text style={styles.sectionTitle}>Tasks</Text>
        <Button title="+ New task" onPress={() => navigation.navigate('TaskForm', { projectId })} style={styles.newButton} />
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search tasks by name"
        placeholderTextColor="#94a3b8"
        value={search}
        onChangeText={setSearch}
        autoCorrect={false}
      />
      <Text style={styles.filterLabel}>Status</Text>
      <ChipSelect options={TASK_STATUSES} value={status} onChange={setStatus} allLabel="All" />
      <Text style={styles.filterLabel}>Priority</Text>
      <ChipSelect options={PRIORITIES} value={priority} onChange={setPriority} allLabel="All" />
      <View style={{ height: 12 }} />
      <ErrorBox error={actionError} />
      <ErrorBox error={tasks.error} onRetry={tasks.reload} />
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={tasks.data?.data ?? []}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          tasks.loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          ) : !tasks.error ? (
            <Text style={styles.empty}>No tasks found.</Text>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item: t }) => (
          <View style={[cardStyle, styles.taskRow]}>
            <Pressable
              onPress={() => toggleComplete(t)}
              style={[styles.check, t.status === 'COMPLETED' && styles.checkDone]}
              accessibilityLabel={`Mark ${t.name} as completed`}
            >
              {t.status === 'COMPLETED' && <Text style={styles.checkMark}>✓</Text>}
            </Pressable>
            <Pressable style={{ flex: 1 }} onPress={() => navigation.navigate('TaskForm', { projectId, task: t })}>
              <Text style={[styles.taskName, t.status === 'COMPLETED' && styles.taskDone]}>{t.name}</Text>
              {t.description ? <Text style={styles.desc}>{t.description}</Text> : null}
              <View style={styles.badges}>
                <Badge value={t.status} label={labelFor(TASK_STATUSES, t.status)} />
                <Badge value={t.priority} label={`${labelFor(PRIORITIES, t.priority)} priority`} />
              </View>
              <Text style={styles.meta}>Due {formatDate(t.dueDate)}</Text>
            </Pressable>
            <Pressable onPress={() => confirmDelete(t)} hitSlop={8}>
              <Text style={styles.delete}>Delete</Text>
            </Pressable>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, flexGrow: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  projectName: { flex: 1, fontSize: 20, fontWeight: '700', color: colors.text },
  desc: { color: colors.muted, marginTop: 4 },
  meta: { color: colors.muted, fontSize: 13, marginTop: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  newButton: { paddingVertical: 8 },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    marginBottom: 10,
  },
  filterLabel: { fontSize: 13, color: colors.muted, marginTop: 8, marginBottom: 6 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 20 },
  taskRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkDone: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  checkMark: { color: '#fff', fontWeight: '700' },
  taskName: { fontSize: 16, fontWeight: '600', color: colors.text },
  taskDone: { textDecorationLine: 'line-through', color: '#94a3b8' },
  badges: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  delete: { color: colors.danger, fontSize: 13 },
});
