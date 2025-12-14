// app/(tabs)/favorites.tsx
import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { getFavoriteRecipes, getSavedRecipes, removeSavedRecipe, toggleFavorite } from '../../lib/api/saved'
import { Recipe } from '../../lib/models/types'
import { theme } from '../../lib/theme'
import { safeGoBack } from '../../lib/utils/navigation'
import { useAuth } from '../../lib/viewmodels/useAuth'

type TabType = 'saved' | 'favorites'

export default function FavoritesScreen() {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('saved')
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const prevUserIdRef = useRef<string | null>(null)

  const loadRecipes = async () => {
    console.log('[loadRecipes] Starting - user:', !!user, 'hasLoadedOnce:', hasLoadedOnce)
    
    try {
      setLoading(true)
      setError(null)

      if (!user) {
        console.log('[loadRecipes] No user, stopping')
        setSavedRecipes([])
        setFavoriteRecipes([])
        setLoading(false)
        setHasLoadedOnce(true)
        return
      }

      console.log('[loadRecipes] Fetching favorites for user:', user.id)
      const [savedRes, favRes] = await Promise.all([
        getSavedRecipes(user.id),
        getFavoriteRecipes(user.id),
      ])

      if (savedRes.error || favRes.error) {
        setError('Nepodarilo sa načítať recepty')
        console.error('[loadRecipes] Error:', savedRes.error || favRes.error)
      } else {
        const savedRecipesData = savedRes.data
          ?.filter(saved => saved.recipes)
          .map(saved => saved.recipes!) || []

        const favoriteRecipesData = favRes.data
          ?.filter(saved => saved.recipes)
          .map(saved => saved.recipes!) || []

        console.log('[loadRecipes] Success - saved:', savedRecipesData.length, 'favorites:', favoriteRecipesData.length)
        setSavedRecipes(savedRecipesData)
        setFavoriteRecipes(favoriteRecipesData)
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

  const handleRemoveSaved = async (recipeId: number) => {
    if (!user) return

    try {
      const { error } = await removeSavedRecipe(user.id, recipeId)
      if (error) {
        console.error('Error removing recipe:', error)
      } else {
        setSavedRecipes(prev => prev.filter(r => r.id !== recipeId))
        setFavoriteRecipes(prev => prev.filter(r => r.id !== recipeId))
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleToggleFavorite = async (recipeId: number, currentFavoriteState: boolean) => {
    if (!user) return

    try {
      const newFavoriteState = !currentFavoriteState
      const { error } = await toggleFavorite(user.id, recipeId, newFavoriteState)

      if (error) {
        console.error('Error toggling favorite:', error)
      } else {
        // Reload recipes to get updated state
        await loadRecipes()
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleRecipePress = (recipeId: number, isFavorite: boolean) => {
    router.push({
      pathname: '/(tabs)/recipe-detail',
      params: { id: recipeId, isFavorite: isFavorite.toString() }
    } as any)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50'
      case 'medium': return '#FF9800'
      case 'hard': return '#F44336'
      default: return '#999'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Ľahké'
      case 'medium': return 'Stredné'
      case 'hard': return 'Ťažké'
      default: return difficulty
    }
  }

  const currentRecipes = activeTab === 'saved' ? savedRecipes : favoriteRecipes
  const isInFavorites = (recipeId: number) => favoriteRecipes.some(r => r.id === recipeId)

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
        <TouchableOpacity onPress={safeGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Moje recepty</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
          onPress={() => setActiveTab('saved')}
        >
          <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
            Uložené ({savedRecipes.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
          onPress={() => setActiveTab('favorites')}
        >
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>
            Obľúbené ({favoriteRecipes.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recipe List */}
      {currentRecipes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyEmoji}>{activeTab === 'saved' ? '📝' : '♥️'}</Text>
          <Text style={styles.emptyText}>
            {activeTab === 'saved'
              ? 'Zatiaľ nemáš žiadne uložené recepty'
              : 'Zatiaľ nemáš žiadne obľúbené recepty'
            }
          </Text>
          <Text style={styles.emptySubtext}>
            {activeTab === 'saved'
              ? 'Začni objavovať recepty a pridávaj si ich'
              : 'Označ recepty ako obľúbené pomocou ♥️'
            }
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push('/(tabs)/recipes' as any)}
          >
            <Text style={styles.exploreButtonText}>Objavuj recepty</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.recipeList}>
            {currentRecipes.map((recipe) => {
              const primaryImage = recipe.recipe_images?.find(img => img.is_primary)
              const imageUrl = primaryImage?.image_url || recipe.recipe_images?.[0]?.image_url
              const isFavorite = isInFavorites(recipe.id)

              return (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.recipeCard}
                  onPress={() => handleRecipePress(recipe.id, isFavorite)}
                  activeOpacity={0.7}
                >
                  {/* Image */}
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.recipeImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.recipeImage, styles.placeholderImage]}>
                      <Text style={styles.placeholderText}>🍳</Text>
                    </View>
                  )}

                  {/* Content */}
                  <View style={styles.recipeContent}>
                    <View style={styles.recipeTitleRow}>
                      <Text style={styles.recipeTitle} numberOfLines={1}>{recipe.title}</Text>
                      {isFavorite && <Text style={styles.favoriteHeart}>♥️</Text>}
                    </View>

                    {/* Info */}
                    <View style={styles.recipeInfo}>
                      <View style={styles.infoBadge}>
                        <Text style={[styles.infoBadgeText, { color: getDifficultyColor(recipe.difficulty) }]}>
                          {getDifficultyText(recipe.difficulty)}
                        </Text>
                      </View>

                      {recipe.prep_time_minutes && (
                        <View style={styles.infoBadge}>
                          <Text style={styles.infoBadgeIcon}>⏱️</Text>
                          <Text style={styles.infoBadgeText}>{recipe.prep_time_minutes} min</Text>
                        </View>
                      )}

                      <View style={styles.infoBadge}>
                        <Text style={styles.infoBadgeIcon}>🍽️</Text>
                        <Text style={styles.infoBadgeText}>{recipe.servings}</Text>
                      </View>
                    </View>

                    {/* Description */}
                    {recipe.description && (
                      <Text style={styles.recipeDescription} numberOfLines={2}>
                        {recipe.description}
                      </Text>
                    )}

                    {/* Actions */}
                    <View style={styles.recipeActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, isFavorite && styles.actionButtonActive]}
                        onPress={(e) => {
                          e.stopPropagation()
                          handleToggleFavorite(recipe.id, isFavorite)
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.actionButtonText}>
                          {isFavorite ? '♥️ Obľúbené' : '🤍 Pridať do obľúbených'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={(e) => {
                          e.stopPropagation()
                          handleRemoveSaved(recipe.id)
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.removeButtonText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        </ScrollView>
      )}
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
    paddingBottom: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: theme.colors.textPrimary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
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
  exploreButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    marginTop: 8,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  recipeList: {
    padding: 16,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  recipeImage: {
    width: 120,
    height: 160,
    backgroundColor: '#E0E0E0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
  },
  recipeContent: {
    flex: 1,
    padding: 12,
  },
  recipeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  recipeTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  favoriteHeart: {
    fontSize: 18,
  },
  recipeInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
  },
  infoBadgeIcon: {
    fontSize: 11,
  },
  infoBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  recipeDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  recipeActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 'auto',
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  removeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E74C3C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 16,
  },
})
