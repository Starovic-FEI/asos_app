// app/(tabs)/recipes.tsx
import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import RecipeCarousel from '../../components/RecipeCarousel'
import RecipeFiltersModal, { RecipeFilters } from '../../components/RecipeFilters'
import { getUnsavedRecipes } from '../../lib/api/recipies'
import { hasUserReported, reportRecipe } from '../../lib/api/reports'
import { saveRecipe } from '../../lib/api/saved'
import { Recipe } from '../../lib/models/types'
import { theme } from '../../lib/theme'
import { showAlert, showConfirm } from '../../lib/utils/alert'
import { useAuth } from '../../lib/viewmodels/useAuth'

export default function RecipesScreen() {
  const { user, profile, logout, loading: authLoading } = useAuth()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<RecipeFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [filterCount, setFilterCount] = useState(0)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const prevUserIdRef = useRef<string | null>(null)

  const loadRecipes = async () => {
    console.log('[loadRecipes] Starting - user:', !!user, 'hasLoadedOnce:', hasLoadedOnce)
    
    try {
      setLoading(true)
      setError(null)
      
      if (!user) {
        console.log('[loadRecipes] No user, stopping')
        setRecipes([])
        setLoading(false)
        setHasLoadedOnce(true)
        return
      }

      console.log('[loadRecipes] Fetching recipes for user:', user.id)
      const { data, error: fetchError } = await getUnsavedRecipes(user.id, 20, filters)

      if (fetchError) {
        setError('Nepodarilo sa načítať recepty')
        console.error('[loadRecipes] Error:', fetchError)
      } else if (data) {
        console.log('[loadRecipes] Success - loaded', data.length, 'recipes')
        setRecipes(data)
      }
    } catch (err) {
      setError('Nastala chyba pri načítavaní receptov')
      console.error('[loadRecipes] Exception:', err)
    } finally {
      console.log('[loadRecipes] Finished')
      setLoading(false)
      setHasLoadedOnce(true)
    }
  }

  // Main effect - only runs on mount and when filters change
  useEffect(() => {
    console.log('[Effect:main] Triggered - authLoading:', authLoading, 'user:', !!user, 'hasLoadedOnce:', hasLoadedOnce)
    
    if (authLoading) {
      console.log('[Effect:main] Auth still loading, waiting...')
      return
    }

    loadRecipes()
  }, [filters])

  // Auth effect - only runs when auth completes
  useEffect(() => {
    console.log('[Effect:auth] Triggered - authLoading:', authLoading, 'hasLoadedOnce:', hasLoadedOnce)
    
    if (!authLoading && !hasLoadedOnce) {
      console.log('[Effect:auth] Auth ready, initial load')
      loadRecipes()
    }
  }, [authLoading])

  // User change effect - reload when user ID actually changes (login/logout)
  useEffect(() => {
    const currentUserId = user?.id || null
    const prevUserId = prevUserIdRef.current
    console.log('[Effect:user] Check - prev:', prevUserId, 'current:', currentUserId, 'hasLoadedOnce:', hasLoadedOnce)
    
    // Always update ref to current user ID
    prevUserIdRef.current = currentUserId
    
    // Only reload if:
    // 1. Auth is complete AND
    // 2. We've loaded at least once AND  
    // 3. Previous user ID was not null (not initial load) AND
    // 4. User ID actually changed
    if (!authLoading && hasLoadedOnce && prevUserId !== null && prevUserId !== currentUserId) {
      console.log('[Effect:user] User ID changed, reloading')
      loadRecipes()
    }
  }, [user])

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Prevent body scrolling on web
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      document.body.style.height = '100vh'
      document.documentElement.style.height = '100vh'
      
      return () => {
        document.body.style.overflow = ''
        document.documentElement.style.overflow = ''
        document.body.style.height = ''
        document.documentElement.style.height = ''
      }
    }
  }, [])

  useEffect(() => {
    // Spočítame počet aktívnych filtrov
    let count = 0
    if (filters.categoryId) count++
    if (filters.difficulty) count++
    if (filters.maxPrepTime) count++
    if (filters.tagIds && filters.tagIds.length > 0) count++
    setFilterCount(count)
  }, [filters])

  const handleLike = async (recipeId: number) => {
    if (!user) return

    try {
      // Uložíme recept do favourite
      const { error } = await saveRecipe(user.id, recipeId)
      if (error) {
        console.error('Error saving recipe:', error)
      } else {
        // Odstránime recept zo zoznamu
        setRecipes(prev => prev.filter(r => r.id !== recipeId))

        // Ak došli recepty, načítame nové
        if (recipes.length <= 3) {
          loadRecipes()
        }
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleReport = async (recipeId: number) => {
    if (!user) return

    try {
      // Check if user already reported this recipe
      const { hasReported } = await hasUserReported(user.id, recipeId)
      
      if (hasReported) {
        showAlert('Už nahlásené', 'Tento recept si už predtým nahlásil.')
        // Still remove it from the list
        setRecipes(prev => prev.filter(r => r.id !== recipeId))
        if (recipes.length <= 3) {
          loadRecipes()
        }
        return
      }

      // Show confirmation dialog
      showConfirm(
        'Nahlásiť recept',
        'Naozaj chceš nahlásiť tento recept ako nevhodný obsah?',
        async () => {
          try {
            const { error } = await reportRecipe(user.id, recipeId, 'Nevhodný obsah')
            if (error) {
              console.error('Error reporting recipe:', error)
              showAlert('Chyba', 'Nepodarilo sa nahlásiť recept')
            } else {
              showAlert('✓ Úspech', 'Recept bol nahlásený. Ďakujeme za spätnú väzbu.')
              // Odstránime recept zo zoznamu
              setRecipes(prev => prev.filter(r => r.id !== recipeId))

              // Ak došli recepty, načítame nové
              if (recipes.length <= 3) {
                loadRecipes()
              }
            }
          } catch (err) {
            console.error('Error:', err)
            showAlert('Chyba', 'Nastala neočakávaná chyba')
          }
        },
        undefined,
        'Nahlásiť',
        'Zrušiť'
      )
    } catch (err) {
      console.error('Error checking report status:', err)
    }
  }

  const handleApplyFilters = (newFilters: RecipeFilters) => {
    setFilters(newFilters)
  }

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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Načítavam recepty...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorEmoji}>😞</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadRecipes}>
          <Text style={styles.retryButtonText}>Skúsiť znova</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Objavuj recepty</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            style={styles.filterButton}
          >
            <Text style={styles.filterButtonText}>⚙</Text>
            {filterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
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
      </View>

      {/* Recipe Carousel */}
      <RecipeCarousel
        recipes={recipes}
        onLike={handleLike}
        onReport={handleReport}
      />

      {/* Filters Modal */}
      <RecipeFiltersModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={handleApplyFilters}
      />

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
              <Text style={styles.profileMenuItemText}>Uložené recepty</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={handleCreateRecipe}
              activeOpacity={0.7}
            >
              <Text style={styles.profileMenuItemText}>Vytvoriť recept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.profileMenuItem, styles.profileMenuItemDanger]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
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

// Web-specific styles that aren't supported by React Native StyleSheet
const webContainerStyle = Platform.OS === 'web' ? {
  width: '100vw' as any,
  height: '100vh' as any,
  overflow: 'hidden' as any,
  position: 'fixed' as any,
  top: 0,
  left: 0,
} : {}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    ...webContainerStyle,
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    position: 'relative',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    fontSize: 20,
    color: 'white',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileButton: {
    // Removed padding for proper alignment
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
