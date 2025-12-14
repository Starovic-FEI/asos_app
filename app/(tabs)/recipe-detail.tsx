// app/(tabs)/recipe-detail.tsx
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import { addRating, getUserRating } from '../../lib/api/ratings'
import { getRecipeById } from '../../lib/api/recipies'
import { hasUserReported, reportRecipe } from '../../lib/api/reports'
import { Recipe } from '../../lib/models/types'
import { theme } from '../../lib/theme'
import { showAlert, showConfirm } from '../../lib/utils/alert'
import { safeGoBack } from '../../lib/utils/navigation'
import { useAuth } from '../../lib/viewmodels/useAuth'

export default function RecipeDetailScreen() {
  const { width } = useWindowDimensions()
  const { user } = useAuth()
  const params = useLocalSearchParams()
  const recipeId = parseInt(params.id as string)

  // Určíme, či sme na mobile zariadení (menej ako 768px)
  const isMobile = width < 768

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRating, setUserRating] = useState<number>(0)
  const [isRatingLoading, setIsRatingLoading] = useState(false)
  const [hasReported, setHasReported] = useState(false)
  const [isReporting, setIsReporting] = useState(false)

  useEffect(() => {
    loadRecipe()
    loadUserRating()
    checkIfReported()
  }, [recipeId])

  const loadRecipe = async () => {
    try {
      setLoading(true)
      const { data, error } = await getRecipeById(recipeId)
      if (error) {
        console.error('Error loading recipe:', error)
      } else if (data) {
        setRecipe(data)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadUserRating = async () => {
    if (!user) return
    try {
      const { data } = await getUserRating(user.id, recipeId)
      if (data) {
        setUserRating(data.stars)
      }
    } catch (err) {
      console.error('Error loading rating:', err)
    }
  }

  const handleRating = async (stars: number) => {
    if (!user || isRatingLoading) return

    try {
      setIsRatingLoading(true)
      setUserRating(stars)
      const { error } = await addRating(user.id, recipeId, stars)
      if (error) {
        console.error('Error adding rating:', error)
        setUserRating(0)
      } else {
        await loadRecipe()
      }
    } catch (err) {
      console.error('Error:', err)
      setUserRating(0)
    } finally {
      setIsRatingLoading(false)
    }
  }

  const checkIfReported = async () => {
    if (!user) return
    try {
      const { hasReported: reported } = await hasUserReported(user.id, recipeId)
      setHasReported(reported)
    } catch (err) {
      console.error('Error checking report:', err)
    }
  }

  const handleReport = async () => {
    if (!user || isReporting || hasReported) {
      console.log('Report blocked:', { user: !!user, isReporting, hasReported })
      return
    }

    console.log('Starting report flow...')

    showConfirm(
      'Nahlásiť recept',
      'Naozaj chceš nahlásiť tento recept ako nevhodný obsah?',
      async () => {
        console.log('User confirmed report')
        try {
          setIsReporting(true)
          console.log('Reporting recipe:', recipeId, 'by user:', user.id)
          
          const { error } = await reportRecipe(user.id, recipeId, 'Nevhodný obsah')
          
          if (error) {
            console.error('Error reporting recipe:', error)
            showAlert('Chyba', 'Nepodarilo sa nahlásiť recept')
          } else {
            console.log('Report successful!')
            setHasReported(true)
            showAlert('✓ Úspech', 'Recept bol nahlásený. Ďakujeme za spätnú väzbu. Náš tým ho skontroluje.')
          }
        } catch (err) {
          console.error('Exception during report:', err)
          showAlert('Chyba', 'Nastala neočakávaná chyba')
        } finally {
          setIsReporting(false)
        }
      },
      () => {
        console.log('User cancelled report')
      },
      'Nahlásiť',
      'Zrušiť'
    )
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Načítavam recept...</Text>
      </View>
    )
  }

  if (!recipe) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Recept sa nenašiel</Text>
        <TouchableOpacity style={styles.backButton} onPress={safeGoBack}>
          <Text style={styles.backButtonText}>Späť</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const images = recipe.recipe_images || []

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={safeGoBack} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail receptu</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Responsive Layout */}
      <View style={[styles.mainContent, isMobile && styles.mainContentMobile]}>
        {/* Left Side - Images */}
        <ScrollView style={[styles.leftSide, isMobile && styles.leftSideMobile]} showsVerticalScrollIndicator={false}>
          <View style={styles.imagesColumn}>
            {images.length > 0 ? (
              images.map((image, index) => (
                <View key={image.id} style={styles.imageWrapper}>
                  <Image
                    source={{ uri: image.image_url }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  {image.is_primary && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>Hlavný obrázok</Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={[styles.image, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>🍳</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Right Side - Content */}
        <ScrollView style={[styles.rightSide, isMobile && styles.rightSideMobile]} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>{recipe.title}</Text>

            {/* Quick Info */}
            <View style={styles.infoRow}>
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
                <Text style={styles.infoBadgeText}>{recipe.servings} porcie</Text>
              </View>
              {recipe.avg_rating > 0 && (
                <View style={styles.infoBadge}>
                  <Text style={styles.infoBadgeIcon}>⭐</Text>
                  <Text style={styles.infoBadgeText}>{recipe.avg_rating.toFixed(1)}</Text>
                </View>
              )}
            </View>

            {/* Rating */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingTitle}>Tvoje hodnotenie:</Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleRating(star)}
                    disabled={isRatingLoading}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.star}>
                      {star <= userRating ? '⭐' : '☆'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category */}
            {recipe.categories && (
              <View style={styles.categoryContainer}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{recipe.categories.name}</Text>
                </View>
              </View>
            )}

            {/* Description */}
            {recipe.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📝 Popis</Text>
                <Text style={styles.description}>{recipe.description}</Text>
              </View>
            )}

            {/* Ingredients */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🥘 Ingrediencie</Text>
                {recipe.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <View style={styles.ingredientBullet} />
                    <Text style={styles.ingredientText}>
                      <Text style={styles.ingredientAmount}>
                        {ingredient.amount} {ingredient.unit}
                      </Text>
                      {' '}{ingredient.name}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Steps */}
            {recipe.steps && recipe.steps.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👨‍🍳 Postup prípravy</Text>
                {recipe.steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Tags */}
            {recipe.recipe_tags && recipe.recipe_tags.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏷️ Tagy</Text>
                <View style={styles.tagsRow}>
                  {recipe.recipe_tags.map((recipeTag) => (
                    <View key={recipeTag.id} style={styles.tag}>
                      <Text style={styles.tagText}>{recipeTag.tags?.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Created Date */}
            <View style={styles.section}>
              <Text style={styles.metaText}>
                Pridané: {new Date(recipe.created_at).toLocaleDateString('sk-SK')}
              </Text>
            </View>

            {/* Report Button */}
            <View style={styles.reportSection}>
              <TouchableOpacity
                style={[styles.reportButton, hasReported && styles.reportButtonDisabled]}
                onPress={handleReport}
                disabled={hasReported || isReporting}
                activeOpacity={0.7}
              >
                <Text style={styles.reportButtonText}>
                  {hasReported ? '✓ Nahlásené' : '⚠️ Nahlásiť recept'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  errorText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: 24,
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
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 28,
    color: theme.colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  leftSide: {
    width: '40%',
    backgroundColor: '#f5f5f5',
  },
  imagesColumn: {
    padding: 16,
    gap: 16,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 450,
    backgroundColor: '#E0E0E0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  placeholderText: {
    fontSize: 80,
  },
  primaryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  primaryBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  rightSide: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 16,
    lineHeight: 36,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoBadgeIcon: {
    fontSize: 14,
  },
  infoBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  ratingSection: {
    backgroundColor: theme.colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    fontSize: 32,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'flex-start',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingLeft: 8,
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 8,
    marginRight: 12,
  },
  ingredientText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  ingredientAmount: {
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tagText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  metaText: {
    fontSize: 13,
    color: theme.colors.textDisabled,
    fontStyle: 'italic',
  },
  // Mobile styles - jednosĺpcové rozloženie
  mainContentMobile: {
    flexDirection: 'column',
  },
  leftSideMobile: {
    width: '100%',
    maxHeight: 400,
  },
  rightSideMobile: {
    width: '100%',
  },
  reportSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  reportButton: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  reportButtonDisabled: {
    backgroundColor: '#E0E0E0',
    borderColor: '#999',
    opacity: 0.6,
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
  },
})
