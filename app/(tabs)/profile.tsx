import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Layout, Spacing } from '@/constants/Layout';
import { Typography, TextStyles } from '@/constants/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';

export default function ProfileScreen() {
  const { colorScheme, themePreference, setThemePreference, toggleTheme } = useTheme();
  const colors = Colors[colorScheme];
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const getThemeDisplayText = () => {
    switch (themePreference) {
      case 'light': return 'Light Mode';
      case 'dark': return 'Dark Mode';
      case 'system': return 'System Default';
      default: return 'System Default';
    }
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        { icon: 'person.circle', label: 'Edit Profile', arrow: true },
        { icon: 'location', label: 'Manage Addresses', arrow: true },
        { icon: 'creditcard', label: 'Payment Methods', arrow: true },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { 
          icon: themePreference === 'dark' ? 'moon.fill' : themePreference === 'light' ? 'sun.max.fill' : 'circle.lefthalf.filled', 
          label: 'Theme', 
          arrow: true, 
          value: getThemeDisplayText(),
          onPress: () => {
            Alert.alert(
              'Choose Theme',
              'Select your preferred theme',
              [
                { text: 'Light Mode', onPress: () => setThemePreference('light') },
                { text: 'Dark Mode', onPress: () => setThemePreference('dark') },
                { text: 'System Default', onPress: () => setThemePreference('system') },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }
        },
        { icon: 'bell', label: 'Notifications', toggle: true, value: notificationsEnabled, onToggle: setNotificationsEnabled },
        { icon: 'globe', label: 'Language', arrow: true, value: 'English' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'questionmark.circle', label: 'Help Center', arrow: true },
        { icon: 'star', label: 'Rate Us', arrow: true },
        { icon: 'doc.text', label: 'Terms & Conditions', arrow: true },
        { icon: 'shield', label: 'Privacy Policy', arrow: true },
      ],
    },
    {
      title: 'More',
      items: [
        { icon: 'info.circle', label: 'About Us', arrow: true },
        { icon: 'arrow.right.square', label: 'Sign Out', arrow: true, danger: true },
      ],
    },
  ];

  const renderSettingItem = (item: any, isLast: boolean) => (
    <TouchableOpacity
      key={item.label}
      style={[
        styles.settingItem,
        !isLast && { borderBottomColor: colors.divider, borderBottomWidth: 1 },
      ]}
      activeOpacity={item.toggle ? 1 : 0.7}
      onPress={item.onPress}
    >
      <View style={styles.settingLeft}>
        <IconSymbol 
          name={item.icon} 
          size={22} 
          color={item.danger ? colors.error : colors.textSecondary} 
        />
        <Text style={[
          styles.settingLabel, 
          { color: item.danger ? colors.error : colors.text }
        ]}>
          {item.label}
        </Text>
      </View>
      <View style={styles.settingRight}>
        {item.value && typeof item.value === 'string' && (
          <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
            {item.value}
          </Text>
        )}
        {item.toggle && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.background}
          />
        )}
        {item.arrow && (
          <IconSymbol 
            name="chevron.right" 
            size={18} 
            color={colors.textTertiary} 
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity>
          <IconSymbol name="gearshape" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Info */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>DK</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              Dhananjay Kumar
            </Text>
            <Text style={[styles.userPhone, { color: colors.textSecondary }]}>
              +91 98765 43210
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              dhananjay@example.com
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: colors.primary + '15' }]}
            activeOpacity={0.7}
          >
            <IconSymbol name="pencil" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Membership Card */}
        <View style={[styles.membershipCard, { 
          backgroundColor: colors.accent + '20',
          borderColor: colors.accent,
        }]}>
          <View style={styles.membershipContent}>
            <IconSymbol name="star.fill" size={24} color={colors.accent} />
            <View style={styles.membershipInfo}>
              <Text style={[styles.membershipTitle, { color: colors.text }]}>
                Gold Member
              </Text>
              <Text style={[styles.membershipSubtitle, { color: colors.textSecondary }]}>
                You've saved ₹2,340 this month
              </Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={[styles.membershipAction, { color: colors.primary }]}>
              View Benefits
            </Text>
          </TouchableOpacity>
        </View>

        {/* Settings Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
              {section.items.map((item, index) => 
                renderSettingItem(item, index === section.items.length - 1)
              )}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.textTertiary }]}>
            AiSupermart v1.0.0
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...TextStyles.h4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: Layout.card.borderRadius,
    ...Layout.shadow.sm,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    ...TextStyles.h4,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...TextStyles.bodyLarge,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xxs,
  },
  userPhone: {
    ...TextStyles.bodySmall,
    marginBottom: Spacing.xxs,
  },
  userEmail: {
    ...TextStyles.caption,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  membershipCard: {
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: Layout.card.borderRadius,
    borderWidth: 1,
  },
  membershipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  membershipInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  membershipTitle: {
    ...TextStyles.bodyLarge,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xxs,
  },
  membershipSubtitle: {
    ...TextStyles.bodySmall,
  },
  membershipAction: {
    ...TextStyles.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    ...TextStyles.caption,
    fontWeight: Typography.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.wide,
    marginLeft: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionContent: {
    marginHorizontal: Spacing.lg,
    borderRadius: Layout.card.borderRadius,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    ...TextStyles.body,
    marginLeft: Spacing.md,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    ...TextStyles.bodySmall,
    marginRight: Spacing.sm,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: Spacing.xxxl,
    marginBottom: Spacing.xl,
  },
  versionText: {
    ...TextStyles.caption,
  },
});