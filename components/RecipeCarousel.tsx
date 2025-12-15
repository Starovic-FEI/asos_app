// components/RecipeCarousel.tsx
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useRef, useState } from 'react'
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { Recipe } from '../lib/models/types'
import { theme } from '../lib/theme'

interface RecipeCarouselProps {
  recipes: Recipe[]
  onLike: (recipeId: number) => void
  onReport: (recipeId: number) => void
}

export default function RecipeCarousel({ recipes, onLike, onReport }: RecipeCarouselProps) {
  const { width } = useWindowDimensions()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const isTransitioning = useSharedValue(false)

  const cardWidth = width - 32
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const nextCardTranslateX = useSharedValue(cardWidth * 1.2)
  const nextCardOpacity = useSharedValue(0)
  const swipeDirection = useSharedValue(0)

  const isMobile = width < 768


  const handleNextImage = () => {
    const current = recipes[currentIndex]
    if (current?.recipe_images && current.recipe_images.length > 1) {
      setCurrentImageIndex((prev) => (prev === (current.recipe_images?.length ?? 1) - 1 ? 0 : prev + 1))
    }
  }

  const handlePreviousImage = () => {
    const current = recipes[currentIndex]
    if (current?.recipe_images && current.recipe_images.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? (current.recipe_images?.length ?? 1) - 1 : prev - 1))
    }
  }

  const nextRecipeTimeoutRef = useRef<number | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)

  const handleNextRecipe = (direction: number) => {
    if (nextRecipeTimeoutRef.current !== null) {
      return
    }
    
    swipeDirection.value = direction
    
    nextRecipeTimeoutRef.current = setTimeout(() => {
      nextRecipeTimeoutRef.current = null
      
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex === recipes.length - 1 ? 0 : prevIndex + 1
        
        setCurrentImageIndex(0)
        
        const slideInDirection = direction > 0 ? -1 : 1
        translateX.value = slideInDirection * cardWidth * 1.2
        translateY.value = 0
        
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            translateX.value = withSpring(0, { damping: 150, stiffness: 500 }, () => {
              isTransitioning.value = false
            })
          })
        })
        
        nextCardOpacity.value = 0
        nextCardTranslateX.value = cardWidth * 1.2
        
        return newIndex
      })
    }, 200)
  }

  const handleLike = () => {
    console.log('🔵 handleLike called', { currentIndex, recipeId: recipes[currentIndex]?.id })
    if (isTransitioning.value || !recipes[currentIndex]) {
      console.log('⚠️ Blocked: transitioning or no recipe')
      return
    }

    isTransitioning.value = true
    console.log('✅ Calling onLike with recipeId:', recipes[currentIndex].id)
    onLike(recipes[currentIndex].id)
    
    const direction = 1
    swipeDirection.value = direction
    
    translateX.value = withSpring(cardWidth * 2, { damping: 20, stiffness: 90 })
    translateY.value = withSpring(0)
    
    nextCardTranslateX.value = -cardWidth * 1.2
    
    setTimeout(() => {
      nextCardOpacity.value = 1
      nextCardTranslateX.value = withSpring(0, { damping: 20, stiffness: 90 })
    }, 100)
    
    handleNextRecipe(direction)
  }

  const handleDislike = () => {
    if (isTransitioning.value || !recipes[currentIndex]) {
      return
    }
    
    isTransitioning.value = true
    
    const direction = -1
    swipeDirection.value = direction
    
    translateX.value = withSpring(-cardWidth * 2, { damping: 20, stiffness: 90 })
    translateY.value = withSpring(0)
    
    nextCardTranslateX.value = cardWidth * 1.2
    
    setTimeout(() => {
      nextCardOpacity.value = 1
      nextCardTranslateX.value = withSpring(0, { damping: 20, stiffness: 90 })
    }, 100)
    
    handleNextRecipe(direction)
  }

  const triggerLike = () => {
    handleLike()
  }

  const triggerDislike = () => {
    handleDislike()
  }

  // Pan gesture only for mobile (web doesn't need swipe gestures)
  const panGesture = Platform.OS !== 'web' ? Gesture.Pan()
    .activeOffsetX([-10, 10]) // Aktivuje sa len pri horizontálnom pohybe ±10px
    .failOffsetY([-15, 15]) // Zruší sa pri vertikálnom pohybe ±15px (scroll)
    .onUpdate((event) => {
      // Len horizontálny pohyb
      translateX.value = event.translationX
      translateY.value = 0 // Ignoruj vertikálny pohyb
    })
    .onEnd((event) => {
      const swipeThreshold = cardWidth * 0.5

      if (Math.abs(event.translationX) > swipeThreshold) {
        const direction = event.translationX > 0 ? 1 : -1
        swipeDirection.value = direction

        if (direction > 0) {
          runOnJS(triggerLike)()
          nextCardTranslateX.value = -cardWidth * 1.2
        } else {
          runOnJS(triggerDislike)()
          nextCardTranslateX.value = cardWidth * 1.2
        }

        translateX.value = withSpring(event.translationX > 0 ? cardWidth * 2 : -cardWidth * 2)
        translateY.value = withSpring(0)

        setTimeout(() => {
          nextCardOpacity.value = 1
          nextCardTranslateX.value = withSpring(0, { damping: 20, stiffness: 90 })
        }, 100)
      } else {
        translateX.value = withSpring(0)
        translateY.value = withSpring(0)
        const direction = event.translationX > 0 ? 1 : -1
        const resetPosition = direction > 0 ? -cardWidth * 1.2 : cardWidth * 1.2
        nextCardOpacity.value = 0
        nextCardTranslateX.value = withSpring(resetPosition, { damping: 20, stiffness: 90 })
      }
    }) : Gesture.Pan()

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-cardWidth, 0, cardWidth],
      [-15, 0, 15],
      Extrapolate.CLAMP
    )

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    }
  })

  const likeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, cardWidth * 0.5],
      [0, 0.6],
      Extrapolate.CLAMP
    )

    return {
      opacity,
    }
  })

  const dislikeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-cardWidth * 0.5, 0],
      [0.6, 0],
      Extrapolate.CLAMP
    )

    return {
      opacity,
    }
  })

  const nextCardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: nextCardTranslateX.value },
      ],
      opacity: nextCardOpacity.value,
    }
  })

  useEffect(() => {
    if (nextRecipeTimeoutRef.current !== null) {
      clearTimeout(nextRecipeTimeoutRef.current)
      nextRecipeTimeoutRef.current = null
    }
    nextCardOpacity.value = 0
    nextCardTranslateX.value = cardWidth * 1.2
    
    // Reset scroll position when recipe changes
    // Use requestAnimationFrame to ensure it happens after render
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 0, animated: false })
        }
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  useEffect(() => {
    if (recipes && recipes.length > 0) {
      const currentRecipe = recipes[currentIndex]
      const nextIndex = currentIndex === recipes.length - 1 ? 0 : currentIndex + 1
      const nextRecipe = recipes[nextIndex]
      
      console.log('Current recipe:', currentRecipe?.title || 'N/A')
      console.log('Next recipe:', nextRecipe?.title || 'N/A')
    }
  }, [currentIndex, recipes])

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🎉</Text>
      <Text style={styles.emptyText}>Už si videl všetky recepty!</Text>
      <Text style={styles.emptySubtext}>Skús zmeniť filtre alebo sa vráť neskôr</Text>
    </View>
  )

  if (!recipes || recipes.length === 0) {
    return renderEmptyState()
  }

  const currentRecipe = recipes[currentIndex]
  
  if (!currentRecipe) {
    return renderEmptyState()
  }

  const images = currentRecipe.recipe_images || []

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
  const nextIndex = currentIndex === recipes.length - 1 ? 0 : currentIndex + 1
  const nextRecipe = recipes[nextIndex]
  const nextImages = nextRecipe?.recipe_images || []
  const nextImage = nextImages[0]

  return (
    <View style={styles.container}>
      {/* Card Stack Container */}
      <View style={styles.cardStack}>
        {/* Next Card (Behind) - Slides in from opposite side */}
        {nextRecipe && (
          <Animated.View style={[styles.nextCard, nextCardStyle]}>
            <View style={styles.imageSection}>
              <View style={styles.imageContainer}>
                {nextImage ? (
                  <Image
                    source={{ uri: nextImage.image_url }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.image, styles.placeholderImage]}>
                    <Text style={styles.placeholderText}>🍳</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.content}>
              <Text style={styles.title} numberOfLines={2}>{nextRecipe.title}</Text>
            </View>
          </Animated.View>
        )}

        {/* Current Card (On Top) */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.mainContent, cardStyle]}>
            {/* Like Overlay (Green) - Only visible on mobile during swipe */}
            {Platform.OS !== 'web' && (
              <>
                <Animated.View style={[styles.swipeOverlay, likeOverlayStyle]} pointerEvents="none">
                  <LinearGradient
                    colors={['rgba(76, 175, 80, 0.9)', 'rgba(76, 175, 80, 0.5)', 'rgba(76, 175, 80, 0.2)', 'transparent']}
                    locations={[0, 0.3, 0.6, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientOverlay}
                  />
                </Animated.View>

                {/* Dislike Overlay (Red) - Only visible on mobile during swipe */}
                <Animated.View style={[styles.swipeOverlay, dislikeOverlayStyle]} pointerEvents="none">
                  <LinearGradient
                    colors={['rgba(244, 67, 54, 0.9)', 'rgba(244, 67, 54, 0.5)', 'rgba(244, 67, 54, 0.2)', 'transparent']}
                    locations={[0, 0.3, 0.6, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientOverlay}
                  />
                </Animated.View>
              </>
            )}

            {/* Mobile: Single ScrollView for everything */}
            {isMobile ? (
              <ScrollView
                key={`recipe-scroll-${currentIndex}`}
                ref={scrollViewRef}
                style={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Image Section */}
                <View style={styles.imageSection}>
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
                </View>

                {/* Content Section - Mobile */}
                <View style={styles.content}>
            {/* Title with Report Button */}
            <View style={styles.titleRow}>
              <Text style={styles.title}>{currentRecipe.title}</Text>
              <TouchableOpacity
                style={styles.reportButton}
                onPress={() => onReport(currentRecipe.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.reportButtonText}>!</Text>
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
                <Text style={styles.sectionTitle}>Popis</Text>
                <Text style={styles.description}>{currentRecipe.description}</Text>
              </View>
            )}

            {/* Ingredients */}
            {currentRecipe.ingredients && currentRecipe.ingredients.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ingrediencie</Text>
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
                <Text style={styles.sectionTitle}>Postup prípravy</Text>
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
                <Text style={styles.sectionTitle}>Tagy</Text>
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
          ) : (
            /* Web: Fixed image on left, scrollable content on right */
            <View style={styles.webLayout}>
              {/* Image Section - Fixed on left */}
              <View style={styles.webImageSection}>
                <View style={styles.imageContainer}>
                  {currentImage ? (
                    <>
                      <Image
                        source={{ uri: currentImage.image_url }}
                        style={styles.image}
                        resizeMode="cover"
                      />

                      {/* Image Navigation Arrows */}
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
              </View>

              {/* Content Section - Scrollable on right */}
              <ScrollView
                key={`recipe-scroll-${currentIndex}`}
                ref={scrollViewRef}
                style={styles.webContentScroll}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.webContent}>
                  {/* Title with Report Button */}
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>{currentRecipe.title}</Text>
                    <TouchableOpacity
                      style={styles.reportButton}
                      onPress={() => onReport(currentRecipe.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.reportButtonText}>!</Text>
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
                      <Text style={styles.sectionTitle}>Popis</Text>
                      <Text style={styles.description}>{currentRecipe.description}</Text>
                    </View>
                  )}

                  {/* Ingredients */}
                  {currentRecipe.ingredients && currentRecipe.ingredients.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Ingrediencie</Text>
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
                      <Text style={styles.sectionTitle}>Postup prípravy</Text>
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
                      <Text style={styles.sectionTitle}>Tagy</Text>
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
          )}
          </Animated.View>
        </GestureDetector>
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
          <Text style={styles.actionButtonIcon}>✓</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// Web-specific styles that aren't supported by React Native StyleSheet
const webContainerStyle = Platform.OS === 'web' ? {
  width: '100vw' as any,
  height: '100vh' as any,
  overflow: 'hidden' as any,
} : {}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    ...webContainerStyle,
  },
  cardStack: {
    flex: 1,
    position: 'relative',
    margin: 16,
  },
  nextCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 1,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 2,
  },
  scrollContent: {
    flex: 1,
  },
  webLayout: {
    flexDirection: 'row',
    flex: 1,
  },
  imageSection: {
    width: '100%',
    height: 400,
    backgroundColor: '#f5f5f5',
  },
  webImageSection: {
    width: '45%',
    height: '100%',
  },
  webContentScroll: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
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
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
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
    backgroundColor: theme.colors.primary,
  },
  likeButton: {
    backgroundColor: theme.colors.primary,
  },
  actionButtonIcon: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    padding: 24,
  },
  webContent: {
    padding: 24,
    paddingLeft: 32,
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
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  reportButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
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
  swipeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    pointerEvents: 'none',
    zIndex: 10,
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
})
