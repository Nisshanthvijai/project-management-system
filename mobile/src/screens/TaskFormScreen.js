import { useLayoutEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import Screen from '../components/Screen';
import Field from '../components/Field';
import Button from '../components/Button';
import ChipSelect from '../components/ChipSelect';
import ErrorBox from '../components/ErrorBox';
import { api } from '../api/client';
import { PRIORITIES, TASK_STATUSES } from '../lib/constants';
import { errorText, isValidDateInput, toDateInput } from '../lib/format';
import { colors } from '../theme';

export default function TaskFormScreen({ route, navigation }) {
  const { projectId, task } = route.params;
  const editing = Boolean(task);

  const [values, setValues] = useState({
    name: task?.name ?? '',
    description: task?.description ?? '',
    priority: task?.priority ?? 'MEDIUM',
    status: task?.status ?? 'PENDING',
    dueDate: toDateInput(task?.dueDate),
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: editing ? 'Edit task' : 'New task' });
  }, [navigation, editing]);

  const set = (field) => (value) => setValues({ ...values, [field]: value });

  const submit = async () => {
    const v = {};
    if (!values.name.trim()) v.name = 'Task name is required';
    if (!isValidDateInput(values.dueDate.trim())) v.dueDate = 'Use the format YYYY-MM-DD, e.g. 2026-12-31';
    setErrors(v);
    if (Object.keys(v).length) return;

    setSaving(true);
    setServerError('');
    const body = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      priority: values.priority,
      status: values.status,
      dueDate: values.dueDate.trim() || null,
    };
    try {
      if (editing) await api.updateTask(task.id, body);
      else await api.createTask({ ...body, projectId });
      navigation.goBack();
    } catch (err) {
      setServerError(errorText(err));
      setSaving(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ErrorBox error={serverError} />
          <Field label="Task name" value={values.name} onChangeText={set('name')} error={errors.name} maxLength={200} />
          <Field label="Description" value={values.description} onChangeText={set('description')} multiline />
          <Text style={styles.label}>Priority</Text>
          <ChipSelect options={PRIORITIES} value={values.priority} onChange={set('priority')} />
          <Text style={[styles.label, { marginTop: 16 }]}>Status</Text>
          <ChipSelect options={TASK_STATUSES} value={values.status} onChange={set('status')} />
          <Field
            label="Due date (YYYY-MM-DD, optional)"
            value={values.dueDate}
            onChangeText={set('dueDate')}
            error={errors.dueDate}
            placeholder="2026-12-31"
            keyboardType="numbers-and-punctuation"
            containerStyle={{ marginTop: 16 }}
          />
          <Button title={editing ? 'Save changes' : 'Create task'} onPress={submit} loading={saving} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  label: { fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 8 },
});
