import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import Screen from '../components/Screen';
import Field from '../components/Field';
import Button from '../components/Button';
import ErrorBox from '../components/ErrorBox';
import { useAuth } from '../context/AuthContext';
import { errorText } from '../lib/format';
import { colors } from '../theme';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [values, setValues] = useState({ fullName: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (field) => (text) => setValues({ ...values, [field]: text });

  const submit = async () => {
    const v = {};
    if (!values.fullName.trim()) v.fullName = 'Full name is required';
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) v.email = 'Enter a valid email address';
    if (values.password.length < 8) v.password = 'Password must be at least 8 characters';
    else if (!/[A-Za-z]/.test(values.password) || !/[0-9]/.test(values.password)) {
      v.password = 'Password needs at least one letter and one number';
    }
    setErrors(v);
    if (Object.keys(v).length) return;

    setSaving(true);
    setServerError('');
    try {
      await register({ fullName: values.fullName.trim(), email: values.email.trim(), password: values.password });
    } catch (err) {
      setServerError(errorText(err));
      setSaving(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create account</Text>
          <ErrorBox error={serverError} />
          <Field label="Full name" value={values.fullName} onChangeText={set('fullName')} error={errors.fullName} />
          <Field
            label="Email"
            value={values.email}
            onChangeText={set('email')}
            error={errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          <Field label="Password" value={values.password} onChangeText={set('password')} error={errors.password} secureTextEntry />
          <Button title="Register" onPress={submit} loading={saving} />
          <Button title="I already have an account" variant="secondary" onPress={() => navigation.goBack()} style={{ marginTop: 10 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, justifyContent: 'center', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 20, textAlign: 'center' },
});
