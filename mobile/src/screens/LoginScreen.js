import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import Field from '../components/Field';
import Button from '../components/Button';
import ErrorBox from '../components/ErrorBox';
import { useAuth } from '../context/AuthContext';
import { errorText } from '../lib/format';
import { colors } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login, notice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const v = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) v.email = 'Enter a valid email address';
    if (!password) v.password = 'Password is required';
    setErrors(v);
    if (Object.keys(v).length) return;

    setSaving(true);
    setServerError('');
    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      setServerError(errorText(err));
      setSaving(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Project Manager</Text>
          <Text style={styles.subtitle}>Log in to continue</Text>
          {notice && (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          )}
          <ErrorBox error={serverError} />
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          <Field label="Password" value={password} onChangeText={setPassword} error={errors.password} secureTextEntry />
          <Button title="Log in" onPress={submit} loading={saving} />
          <Button title="Create an account" variant="secondary" onPress={() => navigation.navigate('Register')} style={{ marginTop: 10 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, justifyContent: 'center', flexGrow: 1 },
  title: { fontSize: 28, fontWeight: '700', color: colors.primary, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.muted, textAlign: 'center', marginBottom: 24 },
  notice: { backgroundColor: colors.warnBg, padding: 12, borderRadius: 10, marginBottom: 12 },
  noticeText: { color: colors.warnText, fontSize: 14 },
});
