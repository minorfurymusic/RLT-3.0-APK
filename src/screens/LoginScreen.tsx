import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Button, Card } from '../components';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../utils/constants';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    setError(null);
    
    // Validar entradas
    if (!username.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    // Verificar credenciais estáticas
    if (username.trim() === 'admin' && password === '123456') {
      onLoginSuccess();
    } else {
      setError('Usuário ou senha incorretos.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Logo / Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoEmoji}>⚡</Text>
            </View>
            <Text style={styles.title}>Real-Life-Track</Text>
            <Text style={styles.subtitle}>Versão 3.0 APK</Text>
          </View>

          {/* Login Card */}
          <Card variant="elevated" style={styles.card}>
            <Text style={styles.cardTitle}>Entrar na Conta de Teste</Text>
            <Text style={styles.cardSubtitle}>
              Utilize o usuário padrão para realizar os testes da interface.
            </Text>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            {/* Inputs */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Usuário</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: admin"
                placeholderTextColor={COLORS.textLight}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Button
              title="Entrar"
              variant="primary"
              onPress={handleLogin}
              style={styles.loginButton}
            />
          </Card>

          {/* Footer info */}
          <Text style={styles.footerText}>
            Uso restrito para avaliação de UI/UX.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  logoEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: FONT_SIZES.xxl + 4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SPACING.xs,
    letterSpacing: 1,
  },
  card: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  errorContainer: {
    backgroundColor: COLORS.dangerLight + '20',
    padding: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.dangerLight + '40',
  },
  errorText: {
    color: COLORS.dangerDark,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: '#fafbfd',
  },
  loginButton: {
    height: 48,
    marginTop: SPACING.md,
  },
  footerText: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xl,
  },
});

export default LoginScreen;
