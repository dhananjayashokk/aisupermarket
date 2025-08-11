import { StyleSheet, ScrollView, View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedButton, ThemedInput, ThemedCard } from '@/components/themed';
import { useAppColorScheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';
import { TextStyles } from '@/constants/Typography';
import { useState } from 'react';

export default function LoginScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme];
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push('/auth/otp');
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Info', `${provider} login integration would be implemented here`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.logo, { color: colors.primary }]}>
            AiSupermart
          </Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Your neighborhood supermarket, delivered
          </Text>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            Welcome back!
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            Enter your phone number to continue shopping
          </Text>
        </View>

        {/* Login Form */}
        <ThemedCard style={styles.loginCard}>
          <ThemedInput
            label="Phone Number"
            placeholder="Enter your 10-digit phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={10}
            leftIcon="phone"
          />
          
          <ThemedButton
            title={isLoading ? "Sending OTP..." : "Send OTP"}
            onPress={handleSendOTP}
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            style={styles.otpButton}
          />
          
          <Text style={[styles.otpInfo, { color: colors.textTertiary }]}>
            We'll send you a verification code via SMS
          </Text>
        </ThemedCard>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
          <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
            or continue with
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
        </View>

        {/* Social Login */}
        <View style={styles.socialContainer}>
          <ThemedButton
            title="Google"
            onPress={() => handleSocialLogin('Google')}
            variant="outline"
            size="lg"
            leftIcon="globe"
            style={[styles.socialButton, { flex: 1 }]}
          />
          
          <ThemedButton
            title="Apple"
            onPress={() => handleSocialLogin('Apple')}
            variant="outline"
            size="lg"
            leftIcon="apple.logo"
            style={[styles.socialButton, { flex: 1 }]}
          />
        </View>

        {/* Guest Option */}
        <ThemedButton
          title="Continue as Guest"
          onPress={() => router.replace('/(tabs)')}
          variant="ghost"
          style={styles.guestButton}
        />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            By continuing, you agree to our{' '}
            <Text style={{ color: colors.primary }}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={{ color: colors.primary }}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl * 2,
  },
  logo: {
    ...TextStyles.h1,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  tagline: {
    ...TextStyles.body,
    textAlign: 'center',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  welcomeTitle: {
    ...TextStyles.h3,
    marginBottom: Spacing.sm,
  },
  welcomeSubtitle: {
    ...TextStyles.body,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  loginCard: {
    marginBottom: Spacing.xl,
  },
  otpButton: {
    marginTop: Spacing.md,
  },
  otpInfo: {
    ...TextStyles.caption,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...TextStyles.bodySmall,
    paddingHorizontal: Spacing.lg,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  socialButton: {
    borderWidth: 1.5,
  },
  guestButton: {
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: Spacing.xxxl,
  },
  footerText: {
    ...TextStyles.caption,
    textAlign: 'center',
    lineHeight: 18,
  },
});