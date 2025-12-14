// app/(tabs)/recipe_create.tsx
import { router } from 'expo-router'
import { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
  Alert,
  Image
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useAuth } from '../../lib/viewmodels/useAuth'
import { createRecipe } from '../../lib/api/recipies'
import { getCategories } from '../../lib/api/categories'
import { getTags, addRecipeTags } from '../../lib/api/tags'
import { uploadMultipleRecipeImages } from '../../lib/api/images'
import { theme } from '../../lib/theme'
import { Category, Tag, Ingredient } from '../../lib/models/types'

interface SelectedImage {
  uri: string
  name?: string
  type?: string
}

export default function RecipeCreateScreen() {
  const { user } = useAuth()

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', amount: '', unit: '' }
  ])
  const [steps, setSteps] = useState<string[]>([''])
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [prepTime, setPrepTime] = useState('')
  const [servings, setServings] = useState('')
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0)

  // Data from API
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  // Načítať kategórie a tagy
  useEffect(() => {
    const loadData = async () => {
      console.log('🔄 Načítavam kategórie a tagy...')

      const { data: categoriesData, error: categoriesError } = await getCategories()
      const { data: tagsData, error: tagsError } = await getTags()

      if (categoriesError) {
        console.error('❌ Chyba pri načítaní kategórií:', categoriesError)
      } else {
        console.log('✅ Kategórie načítané:', categoriesData)
      }

      if (tagsError) {
        console.error('❌ Chyba pri načítaní tagov:', tagsError)
      } else {
        console.log('✅ Tagy načítané:', tagsData)
      }

      if (categoriesData) setCategories(categoriesData)
      if (tagsData) setTags(tagsData)
      setDataLoading(false)
    }

    loadData()
  }, [])

  // Pridať ingredienciu
  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '' }])
  }

  // Odstrániť ingredienciu
  const removeIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index)
    setIngredients(newIngredients.length > 0 ? newIngredients : [{ name: '', amount: '', unit: '' }])
  }

  // Aktualizovať ingredienciu
  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...ingredients]
    newIngredients[index][field] = value
    setIngredients(newIngredients)
  }

  // Pridať krok
  const addStep = () => {
    setSteps([...steps, ''])
  }

  // Odstrániť krok
  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index)
    setSteps(newSteps.length > 0 ? newSteps : [''])
  }

  // Aktualizovať krok
  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps]
    newSteps[index] = value
    setSteps(newSteps)
  }

  // Toggle tag
  const toggleTag = (tagId: number) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId))
    } else {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  // Vybrať obrázky
  const pickImages = async () => {
    // Požiadať o permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== 'granted') {
      Alert.alert('Chyba', 'Potrebujem prístup k fotkám!')
      return
    }

    // Otvoriť image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [4, 3],
    })

    if (!result.canceled && result.assets) {
      const newImages: SelectedImage[] = result.assets.map(asset => ({
        uri: asset.uri,
        name: asset.fileName || undefined,
        type: asset.type || 'image/jpeg'
      }))
      setSelectedImages([...selectedImages, ...newImages])
      console.log('📸 Vybraté obrázky:', newImages.length)
    }
  }

  // Odstrániť obrázok
  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    setSelectedImages(newImages)
    // Ak bol odstránený primary obrázok, nastav nový
    if (index === primaryImageIndex && newImages.length > 0) {
      setPrimaryImageIndex(0)
    }
  }

  // Validácia
  const validate = () => {
    if (!title.trim()) {
      Alert.alert('Chyba', 'Zadaj názov receptu')
      return false
    }
    if (!description.trim()) {
      Alert.alert('Chyba', 'Zadaj popis receptu')
      return false
    }
    if (ingredients.every(ing => !ing.name.trim())) {
      Alert.alert('Chyba', 'Pridaj aspoň jednu ingredienciu')
      return false
    }
    if (steps.every(step => !step.trim())) {
      Alert.alert('Chyba', 'Pridaj aspoň jeden krok')
      return false
    }
    if (!categoryId) {
      Alert.alert('Chyba', 'Vyber kategóriu')
      return false
    }
    if (!prepTime || parseInt(prepTime) <= 0) {
      Alert.alert('Chyba', 'Zadaj čas prípravy')
      return false
    }
    if (!servings || parseInt(servings) <= 0) {
      Alert.alert('Chyba', 'Zadaj počet porcií')
      return false
    }
    return true
  }

  // Uložiť recept
  const handleSave = async () => {
    console.log('=== ZAČÍNAM UKLADANIE RECEPTU ===')

    if (!validate()) {
      console.log('❌ Validácia zlyhala')
      return
    }

    if (!user) {
      console.log('❌ Používateľ nie je prihlásený')
      Alert.alert('Chyba', 'Musíš byť prihlásený')
      return
    }

    console.log('✅ Používateľ:', user.id, user.email)
    setLoading(true)

    try {
      // Filtrovať prázdne ingrediencie a kroky
      const validIngredients = ingredients.filter(ing => ing.name.trim())
      const validSteps = steps.filter(step => step.trim())

      console.log('📝 Ingrediencie:', validIngredients)
      console.log('📋 Kroky:', validSteps)

      const recipeData = {
        title: title.trim(),
        description: description.trim(),
        ingredients: validIngredients,
        steps: validSteps,
        category_id: categoryId,
        difficulty,
        prep_time_minutes: parseInt(prepTime),
        servings: parseInt(servings),
        author_id: user.id,
        avg_rating: 0
      }

      console.log('📤 Odosielam do DB:', recipeData)

      // Vytvoriť recept
      const { data: recipe, error } = await createRecipe(recipeData)

      if (error) {
        console.error('❌ Chyba pri vytváraní receptu:', error)
        Alert.alert('Chyba pri vytváraní', `${error.message}\n\nDetail: ${JSON.stringify(error, null, 2)}`)
        setLoading(false)
        return
      }

      console.log('✅ Recept vytvorený:', recipe)

      // Pridať tagy ak sú vybrané
      if (recipe && selectedTags.length > 0) {
        console.log('🏷️ Pridávam tagy:', selectedTags)
        const { error: tagsError } = await addRecipeTags(recipe.id, selectedTags)

        if (tagsError) {
          console.error('⚠️ Chyba pri pridávaní tagov:', tagsError)
          // Recept sa vytvoril, ale tagy nie - stále je to úspech
        } else {
          console.log('✅ Tagy pridané')
        }
      }

      // Nahrať obrázky ak sú vybrané
      if (recipe && selectedImages.length > 0) {
        console.log('📸 Nahrávam obrázky:', selectedImages.length)

        try {
          // Konvertuj URI na Blob pre web
          const imageBlobs = await Promise.all(
            selectedImages.map(async (img) => {
              const response = await fetch(img.uri)
              return await response.blob()
            })
          )

          const results = await uploadMultipleRecipeImages(
            imageBlobs,
            recipe.id,
            primaryImageIndex
          )

          const errors = results.filter(r => r.error)
          if (errors.length > 0) {
            console.error('⚠️ Niektoré obrázky sa nepodarilo nahrať:', errors)
          } else {
            console.log('✅ Všetky obrázky nahrané')
          }
        } catch (imgError) {
          console.error('⚠️ Chyba pri nahrávaní obrázkov:', imgError)
          // Recept je už vytvorený, obrázky nie sú kritické
        }
      }

      console.log('🎉 RECEPT ÚSPEŠNE VYTVORENÝ! ID:', recipe?.id)

      Alert.alert('Úspech', `Recept "${title}" bol vytvorený!\n\nID: ${recipe?.id}`, [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ])
    } catch (err) {
      console.error('❌ KRITICKÁ CHYBA:', err)
      Alert.alert('Kritická chyba', `${err}\n\n${JSON.stringify(err, null, 2)}`)
    } finally {
      setLoading(false)
      console.log('=== KONIEC UKLADANIA ===')
    }
  }

  if (dataLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Načítavam...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/recipes' as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Späť na swajpovanie</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Vytvor Recept</Text>
      </View>

      {/* Názov */}
      <View style={styles.section}>
        <Text style={styles.label}>Názov receptu *</Text>
        <TextInput
          style={styles.input}
          placeholder="Napr. Špagety Carbonara"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* Popis */}
      <View style={styles.section}>
        <Text style={styles.label}>Popis *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Napíš krátky popis receptu..."
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Kategória */}
      <View style={styles.section}>
        <Text style={styles.label}>Kategória *</Text>
        <View style={styles.categoryContainer}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                categoryId === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setCategoryId(category.id)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.categoryButtonText,
                categoryId === category.id && styles.categoryButtonTextActive
              ]}>
                {category.icon} {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Obtiažnosť */}
      <View style={styles.section}>
        <Text style={styles.label}>Obtiažnosť *</Text>
        <View style={styles.difficultyContainer}>
          {(['easy', 'medium', 'hard'] as const).map(level => (
            <TouchableOpacity
              key={level}
              style={[
                styles.difficultyButton,
                difficulty === level && styles.difficultyButtonActive
              ]}
              onPress={() => setDifficulty(level)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.difficultyButtonText,
                difficulty === level && styles.difficultyButtonTextActive
              ]}>
                {level === 'easy' ? 'Ľahká' : level === 'medium' ? 'Stredná' : 'Ťažká'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Čas a porcie */}
      <View style={styles.row}>
        <View style={[styles.section, styles.halfWidth]}>
          <Text style={styles.label}>Čas (min) *</Text>
          <TextInput
            style={styles.input}
            placeholder="30"
            placeholderTextColor="#999"
            value={prepTime}
            onChangeText={setPrepTime}
            keyboardType="number-pad"
          />
        </View>
        <View style={[styles.section, styles.halfWidth]}>
          <Text style={styles.label}>Porcie *</Text>
          <TextInput
            style={styles.input}
            placeholder="4"
            placeholderTextColor="#999"
            value={servings}
            onChangeText={setServings}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Ingrediencie */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.label}>Ingrediencie *</Text>
          <TouchableOpacity onPress={addIngredient} activeOpacity={0.7}>
            <Text style={styles.addButton}>+ Pridať</Text>
          </TouchableOpacity>
        </View>
        {ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientRow}>
            <TextInput
              style={[styles.input, styles.ingredientName]}
              placeholder="Názov"
              placeholderTextColor="#999"
              value={ingredient.name}
              onChangeText={(value) => updateIngredient(index, 'name', value)}
            />
            <TextInput
              style={[styles.input, styles.ingredientAmount]}
              placeholder="Množstvo"
              placeholderTextColor="#999"
              value={ingredient.amount}
              onChangeText={(value) => updateIngredient(index, 'amount', value)}
            />
            <TextInput
              style={[styles.input, styles.ingredientUnit]}
              placeholder="Jednotka"
              placeholderTextColor="#999"
              value={ingredient.unit}
              onChangeText={(value) => updateIngredient(index, 'unit', value)}
            />
            {ingredients.length > 1 && (
              <TouchableOpacity
                onPress={() => removeIngredient(index)}
                style={styles.removeButton}
                activeOpacity={0.7}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Kroky */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.label}>Postup *</Text>
          <TouchableOpacity onPress={addStep} activeOpacity={0.7}>
            <Text style={styles.addButton}>+ Pridať krok</Text>
          </TouchableOpacity>
        </View>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <TextInput
              style={[styles.input, styles.stepInput]}
              placeholder={`Krok ${index + 1}`}
              placeholderTextColor="#999"
              value={step}
              onChangeText={(value) => updateStep(index, value)}
              multiline
            />
            {steps.length > 1 && (
              <TouchableOpacity
                onPress={() => removeStep(index)}
                style={styles.removeButton}
                activeOpacity={0.7}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Tagy */}
      <View style={styles.section}>
        <Text style={styles.label}>Tagy (voliteľné)</Text>
        <View style={styles.tagsContainer}>
          {tags.map(tag => (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.tagButton,
                selectedTags.includes(tag.id) && styles.tagButtonActive
              ]}
              onPress={() => toggleTag(tag.id)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tagButtonText,
                selectedTags.includes(tag.id) && styles.tagButtonTextActive
              ]}>
                {tag.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Obrázky */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.label}>Obrázky (voliteľné)</Text>
          <TouchableOpacity onPress={pickImages} activeOpacity={0.7}>
            <Text style={styles.addButton}>+ Pridať fotky</Text>
          </TouchableOpacity>
        </View>

        {selectedImages.length > 0 ? (
          <View style={styles.imagesGrid}>
            {selectedImages.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image.uri }} style={styles.imagePreview} />

                {/* Primary badge */}
                {index === primaryImageIndex && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>Hlavná</Text>
                  </View>
                )}

                {/* Tlačidlá */}
                <View style={styles.imageActions}>
                  {index !== primaryImageIndex && (
                    <TouchableOpacity
                      style={styles.setPrimaryButton}
                      onPress={() => setPrimaryImageIndex(index)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.setPrimaryButtonText}>⭐</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.removeImageButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noImagesContainer}>
            <Text style={styles.noImagesText}>📷</Text>
            <Text style={styles.noImagesSubtext}>Zatiaľ žiadne fotky</Text>
          </View>
        )}
      </View>

      {/* Uložiť button */}
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Ukladám...' : 'Vytvoriť Recept'}
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: theme.typography.fontWeight.extraBold,
    color: theme.colors.textPrimary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  categoryButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  categoryButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  categoryButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
  },
  difficultyButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  difficultyButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  difficultyButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  addButton: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
  },
  ingredientRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  ingredientName: {
    flex: 2,
  },
  ingredientAmount: {
    flex: 1,
  },
  ingredientUnit: {
    flex: 1,
  },
  stepRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  stepNumberText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
  },
  stepInput: {
    flex: 1,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE8E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  removeButtonText: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tagButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  tagButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  tagButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  tagButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.textDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  imageContainer: {
    width: 120,
    height: 120,
    position: 'relative',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  primaryBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: theme.colors.primary,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  primaryBadgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
  },
  imageActions: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    gap: 4,
  },
  setPrimaryButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setPrimaryButtonText: {
    fontSize: 14,
  },
  removeImageButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageButtonText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: 18,
  },
  noImagesContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  noImagesText: {
    fontSize: 48,
    marginBottom: theme.spacing.xs,
  },
  noImagesSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
})
