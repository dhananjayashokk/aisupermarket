import { StyleSheet, View, Text, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedButton, ThemedCard } from '@/components/themed';
import { useAppColorScheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, Layout } from '@/constants/Layout';
import { TextStyles, Typography } from '@/constants/Typography';
import { useState, useEffect, useRef } from 'react';

export default function OTPScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme];
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  // Timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeLeft > 0 && !canResend) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft, canResend]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (otpString === '123456') { // Mock OTP for demo
        Alert.alert('Success', 'Login successful!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        Alert.alert('Error', 'Invalid OTP. Please try again.');
      }
    }, 1500);
  };

  const handleResendOTP = () => {
    setTimeLeft(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    Alert.alert('OTP Sent', 'A new verification code has been sent to your phone');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedButton
          title=""
          onPress={() => router.back()}
          variant="ghost"
          leftIcon="arrow.left"
          size="sm"
          style={styles.backButton}
        />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Verify Phone
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Illustration */}
        <View style={[styles.illustrationContainer, { backgroundColor: colors.primary + '10' }]}>
          <IconSymbol name="message.fill" size={64} color={colors.primary} />
        </View>

        {/* Title and Description */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            Enter verification code
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            We've sent a 6-digit code to
          </Text>
          <Text style={[styles.phoneNumber, { color: colors.text }]}>
            +91 98765 43210
          </Text>
        </View>

        {/* OTP Input */}
        <ThemedCard style={styles.otpCard}>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: digit ? colors.primary : colors.border,
                    color: colors.text,
                  },
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value.slice(-1), index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
              />
            ))}
          </View>

          <ThemedButton
            title={isLoading ? "Verifying..." : "Verify OTP"}
            onPress={handleVerifyOTP}
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            style={styles.verifyButton}
          />
        </ThemedCard>

        {/* Resend Section */}
        <View style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: colors.textSecondary }]}>
            Didn't receive the code?
          </Text>
          
          {canResend ? (
            <ThemedButton
              title="Resend OTP"
              onPress={handleResendOTP}
              variant="ghost"
              size="sm"
            />
          ) : (
            <Text style={[styles.timerText, { color: colors.primary }]}>
              Resend in {formatTime(timeLeft)}
            </Text>
          )}
        </View>

        {/* Help Text */}
        <Text style={[styles.helpText, { color: colors.textTertiary }]}>
          Enter "123456" for demo purposes
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    ...TextStyles.bodyLarge,
    fontWeight: Typography.fontWeight.semibold,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxxl,
  },
  illustrationContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.xxxl,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  title: {
    ...TextStyles.h3,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...TextStyles.body,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  phoneNumber: {
    ...TextStyles.bodyLarge,
    fontWeight: Typography.fontWeight.semibold,
  },
  otpCard: {
    marginBottom: Spacing.xl,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 2,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
  },
  verifyButton: {
    marginTop: Spacing.md,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  resendText: {
    ...TextStyles.body,
    marginBottom: Spacing.sm,
  },
  timerText: {
    ...TextStyles.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
  },
  helpText: {
    ...TextStyles.caption,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});