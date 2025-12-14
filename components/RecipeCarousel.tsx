// components/RecipeCarousel.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native'
import { Recipe } from '../lib/models/types'
import { theme } from '../lib/theme'

interface RecipeCarouselProps {
  recipes: Recipe[]
  onLike: (recipeId: number) => void
  onDislike: (recipeId: number) => void
  onReport: (recipeId: number) => void
}

export default function RecipeCarousel({ recipes, onLike, onDislike, onReport }: RecipeCarouselProps) {
  const { width } = useWindowDimensions()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Určíme, či sme na mobile zariadení (menej ako 768px)
  const isMobile = width < 768

  if (!recipes || recipes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🎉</Text>
        <Text style={styles.emptyText}>Už si videl všetky recepty!</Text>
        <Text style={styles.emptySubtext}>Skús zmeniť filtre alebo sa vráť neskôr</Text>
      </View>
    )
  }

  const currentRecipe = recipes[currentIndex]
  const images = currentRecipe.recipe_images || []

  const handleNextRecipe = () => {
    setCurrentIndex((prev) => (prev === recipes.length - 1 ? 0 : prev + 1))
    setCurrentImageIndex(0)
  }

  const handlePreviousRecipe = () => {
    setCurrentIndex((prev) => (prev === 0 ? recipes.length - 1 : prev - 1))
    setCurrentImageIndex(0)
  }

  const handleNextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }
  }

  const handlePreviousImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }
  }

  const handleLike = () => {
    onLike(currentRecipe.id)
    handleNextRecipe()
  }

  const handleDislike = () => {
    onDislike(currentRecipe.id)
    handleNextRecipe()
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#4CAF50'
      case 'medium':
        return '#FF9800'
      case 'hard':
        return '#F44336'
      default:
        return '#999'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Ľahké'
      case 'medium':
        return 'Stredné'
      case 'hard':
        return 'Ťažké'
      default:
        return difficulty
    }
  }

  const currentImage = images[currentImageIndex]

  return (
    <View style={styles.container}>
      {/* Main Content - Responsive Layout */}
      <View style={[styles.mainContent, isMobile && styles.mainContentMobile]}>
        {/* Left Side - Images */}
        <View style={[styles.leftSide, isMobile && styles.leftSideMobile]}>
          <View style={styles.imageContainer}>
            {currentImage ? (
              <>
                <Image
                  source={{ uri: currentImage.image_url }}
                  style={styles.image}
                  resizeMode="cover"
                />

                {/* Image Navigation Arrows - Only show if more than 1 image */}
                {images.length > 1 && (
                  <>
                    <TouchableOpacity
                      style={[styles.imageArrow, styles.imageArrowLeft]}
                      onPress={handlePreviousImage}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.imageArrowText}>‹</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.imageArrow, styles.imageArrowRight]}
                      onPress={handleNextImage}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.imageArrowText}>›</Text>
                    </TouchableOpacity>

                    {/* Image Dots Indicator */}
                    <View style={styles.dotsContainer}>
                      {images.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.dot,
                            currentImageIndex === index && styles.dotActive,
                          ]}
                        />
                      ))}
                    </View>
                  </>
                )}
              </>
            ) : (
              <View style={[styles.image, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>🍳</Text>
              </View>
            )}
          </View>

          {/* Like/Dislike Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.dislikeButton]}
              onPress={handleDislike}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonIcon}>✕</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.likeButton]}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonIcon}>♥</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Side - Information (Scrollable) */}
        <ScrollView style={[styles.rightSide, isMobile && styles.rightSideMobile]} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Title with Report Button */}
            <View style={styles.titleRow}>
              <Text style={styles.title}>{currentRecipe.title}</Text>
              <TouchableOpacity
                style={styles.reportButton}
                onPress={() => onReport(currentRecipe.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.reportButtonText}>⚠️</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Info Row */}
            <View style={styles.infoRow}>
              <View style={styles.infoBadge}>
                <Text style={[styles.infoBadgeText, { color: getDifficultyColor(currentRecipe.difficulty) }]}>
                  {getDifficultyText(currentRecipe.difficulty)}
                </Text>
              </View>

              {currentRecipe.prep_time_minutes && (
                <View style={styles.infoBadge}>
                  <Text style={styles.infoBadgeIcon}>⏱️</Text>
                  <Text style={styles.infoBadgeText}>{currentRecipe.prep_time_minutes} min</Text>
                </View>
              )}

              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeIcon}>🍽️</Text>
                <Text style={styles.infoBadgeText}>{currentRecipe.servings} porcie</Text>
              </View>

              {currentRecipe.avg_rating > 0 && (
                <View style={styles.infoBadge}>
                  <Text style={styles.infoBadgeIcon}>⭐</Text>
                  <Text style={styles.infoBadgeText}>{currentRecipe.avg_rating.toFixed(1)}</Text>
                </View>
              )}
            </View>

            {/* Category */}
            {currentRecipe.categories && (
              <View style={styles.categoryContainer}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{currentRecipe.categories.name}</Text>
                </View>
              </View>
            )}

            {/* Description */}
            {currentRecipe.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📝 Popis</Text>
                <Text style={styles.description}>{currentRecipe.description}</Text>
              </View>
            )}

            {/* Ingredients */}
            {currentRecipe.ingredients && currentRecipe.ingredients.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🥘 Ingrediencie</Text>
                {currentRecipe.ingredients.map((ingredient, index) => (
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
            {currentRecipe.steps && currentRecipe.steps.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👨‍🍳 Postup prípravy</Text>
                {currentRecipe.steps.map((step, index) => (
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
            {currentRecipe.recipe_tags && currentRecipe.recipe_tags.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏷️ Tagy</Text>
                <View style={styles.tagsRow}>
                  {currentRecipe.recipe_tags.map((recipeTag) => (
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
                Pridané: {new Date(currentRecipe.created_at).toLocaleDateString('sk-SK')}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Recipe Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handlePreviousRecipe}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>← Predchádzajúci</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleNextRecipe}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>Ďalší →</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  leftSide: {
    width: '45%',
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 80,
  },
  imageArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  imageArrowLeft: {
    left: 12,
  },
  imageArrowRight: {
    right: 12,
  },
  imageArrowText: {
    fontSize: 32,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginTop: -4,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: 'white',
    width: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: 'white',
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  dislikeButton: {
    backgroundColor: '#95A5A6',
  },
  likeButton: {
    backgroundColor: theme.colors.primary,
  },
  actionButtonIcon: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  rightSide: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    lineHeight: 36,
  },
  reportButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  reportButtonText: {
    fontSize: 18,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
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
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  // Mobile styles - jednosĺpcové rozloženie
  mainContentMobile: {
    flexDirection: 'column',
  },
  leftSideMobile: {
    width: '100%',
    height: 350,
  },
  rightSideMobile: {
    width: '100%',
  },
})
