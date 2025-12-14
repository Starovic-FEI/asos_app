// app/(tabs)/index.tsx
import { router } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native'
import { useAuth } from '../../lib/viewmodels/useAuth'
import { theme } from '../../lib/theme'

export default function HomeScreen() {
  const { user, profile, logout, loading } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const handleLogout = async () => {
    setShowProfileMenu(false)
    await logout()
    router.replace('/(auth)' as any)
  }

  const handleFavorites = () => {
    setShowProfileMenu(false)
    router.push('/(tabs)/favorites' as any)
  }

  const handleCreateRecipe = () => {
    setShowProfileMenu(false)
    router.push('/(tabs)/recipe_create' as any)
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Načítavam...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header with Profile */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.emoji}>🍳</Text>
          <Text style={styles.title}>Recipe Swipe</Text>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => setShowProfileMenu(true)}
          activeOpacity={0.7}
        >
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {profile?.name ? profile.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>
            {profile?.name ? `Ahoj, ${profile.name}!` : 'Ahoj!'}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Vitaj späť v Recipe Swipe
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📧 Email</Text>
          <Text style={styles.infoText}>{user?.email}</Text>
        </View>

        {profile?.name && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>👤 Meno</Text>
            <Text style={styles.infoText}>{profile.name}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.recipesButton}
          onPress={() => router.push('/(tabs)/recipes' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.recipesButtonEmoji}>🍳</Text>
          <Text style={styles.recipesButtonText}>Objavuj recepty</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Menu Modal */}
      <Modal
        visible={showProfileMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProfileMenu(false)}
        >
          <View style={styles.profileMenuContainer}>
            <View style={styles.profileMenuHeader}>
              <View style={styles.profileMenuAvatar}>
                <Text style={styles.profileMenuAvatarText}>
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.profileMenuInfo}>
                <Text style={styles.profileMenuName}>
                  {profile?.name || 'Používateľ'}
                </Text>
                <Text style={styles.profileMenuEmail}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.profileMenuDivider} />

            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={handleFavorites}
              activeOpacity={0.7}
            >
              <Text style={styles.profileMenuItemIcon}>📝</Text>
              <Text style={styles.profileMenuItemText}>Uložené recepty</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={handleCreateRecipe}
              activeOpacity={0.7}
            >
              <Text style={styles.profileMenuItemIcon}>➕</Text>
              <Text style={styles.profileMenuItemText}>Vytvoriť recept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.profileMenuItem, styles.profileMenuItemDanger]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.profileMenuItemIcon}>🚪</Text>
              <Text style={[styles.profileMenuItemText, styles.profileMenuItemTextDanger]}>
                Odhlásiť sa
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  profileButton: {
    padding: 4,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  welcomeCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  recipesButton: {
    backgroundColor: theme.colors.primary,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  recipesButtonEmoji: {
    fontSize: 24,
  },
  recipesButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  profileMenuContainer: {
    backgroundColor: 'white',
    marginTop: 100,
    marginRight: 16,
    borderRadius: 16,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  profileMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
    backgroundColor: theme.colors.background,
  },
  profileMenuAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileMenuAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileMenuInfo: {
    flex: 1,
  },
  profileMenuName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  profileMenuEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  profileMenuDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  profileMenuItemIcon: {
    fontSize: 20,
  },
  profileMenuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  profileMenuItemDanger: {
    backgroundColor: theme.colors.background,
  },
  profileMenuItemTextDanger: {
    color: '#E74C3C',
  },
})
