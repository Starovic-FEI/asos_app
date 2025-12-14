// components/RecipeFilters.tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { theme } from '../lib/theme'
import { getCategories } from '../lib/api/categories'
import { getTags } from '../lib/api/tags'
import { Category, Tag } from '../lib/models/types'

export interface RecipeFilters {
  categoryId?: number
  difficulty?: string
  maxPrepTime?: number
  tagIds?: number[]
}

interface RecipeFiltersModalProps {
  visible: boolean
  onClose: () => void
  filters: RecipeFilters
  onApply: (filters: RecipeFilters) => void
}

const DIFFICULTIES = [
  { value: 'easy', label: 'Ľahké' },
  { value: 'medium', label: 'Stredné' },
  { value: 'hard', label: 'Ťažké' },
]

const PREP_TIMES = [
  { value: 15, label: 'Do 15 min' },
  { value: 30, label: 'Do 30 min' },
  { value: 60, label: 'Do 1 hodiny' },
  { value: 120, label: 'Do 2 hodín' },
]

export default function RecipeFiltersModal({
  visible,
  onClose,
  filters,
  onApply,
}: RecipeFiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<RecipeFilters>(filters)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (visible) {
      loadData()
      setLocalFilters(filters)
    }
  }, [visible, filters])

  const loadData = async () => {
    try {
      setLoading(true)
      const [categoriesRes, tagsRes] = await Promise.all([
        getCategories(),
        getTags(),
      ])

      if (categoriesRes.data) setCategories(categoriesRes.data)
      if (tagsRes.data) setTags(tagsRes.data)
    } catch (error) {
      console.error('Error loading filter data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    onApply(localFilters)
    onClose()
  }

  const handleReset = () => {
    setLocalFilters({})
  }

  const toggleTag = (tagId: number) => {
    const currentTags = localFilters.tagIds || []
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId]

    setLocalFilters({ ...localFilters, tagIds: newTags.length > 0 ? newTags : undefined })
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Filtre</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {/* Kategória */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Kategória</Text>
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.option,
                      !localFilters.categoryId && styles.optionSelected,
                    ]}
                    onPress={() => setLocalFilters({ ...localFilters, categoryId: undefined })}
                  >
                    <Text style={[
                      styles.optionText,
                      !localFilters.categoryId && styles.optionTextSelected,
                    ]}>
                      Všetky
                    </Text>
                  </TouchableOpacity>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.option,
                        localFilters.categoryId === category.id && styles.optionSelected,
                      ]}
                      onPress={() => setLocalFilters({ ...localFilters, categoryId: category.id })}
                    >
                      {category.icon && <Text style={styles.optionIcon}>{category.icon}</Text>}
                      <Text style={[
                        styles.optionText,
                        localFilters.categoryId === category.id && styles.optionTextSelected,
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Obtiažnosť */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Obtiažnosť</Text>
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.option,
                      !localFilters.difficulty && styles.optionSelected,
                    ]}
                    onPress={() => setLocalFilters({ ...localFilters, difficulty: undefined })}
                  >
                    <Text style={[
                      styles.optionText,
                      !localFilters.difficulty && styles.optionTextSelected,
                    ]}>
                      Všetky
                    </Text>
                  </TouchableOpacity>
                  {DIFFICULTIES.map(diff => (
                    <TouchableOpacity
                      key={diff.value}
                      style={[
                        styles.option,
                        localFilters.difficulty === diff.value && styles.optionSelected,
                      ]}
                      onPress={() => setLocalFilters({ ...localFilters, difficulty: diff.value })}
                    >
                      <Text style={[
                        styles.optionText,
                        localFilters.difficulty === diff.value && styles.optionTextSelected,
                      ]}>
                        {diff.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Čas prípravy */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Čas prípravy</Text>
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.option,
                      !localFilters.maxPrepTime && styles.optionSelected,
                    ]}
                    onPress={() => setLocalFilters({ ...localFilters, maxPrepTime: undefined })}
                  >
                    <Text style={[
                      styles.optionText,
                      !localFilters.maxPrepTime && styles.optionTextSelected,
                    ]}>
                      Všetky
                    </Text>
                  </TouchableOpacity>
                  {PREP_TIMES.map(time => (
                    <TouchableOpacity
                      key={time.value}
                      style={[
                        styles.option,
                        localFilters.maxPrepTime === time.value && styles.optionSelected,
                      ]}
                      onPress={() => setLocalFilters({ ...localFilters, maxPrepTime: time.value })}
                    >
                      <Text style={[
                        styles.optionText,
                        localFilters.maxPrepTime === time.value && styles.optionTextSelected,
                      ]}>
                        {time.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Tagy */}
              {tags.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Tagy</Text>
                  <View style={styles.optionsRow}>
                    {tags.map(tag => (
                      <TouchableOpacity
                        key={tag.id}
                        style={[
                          styles.option,
                          localFilters.tagIds?.includes(tag.id) && styles.optionSelected,
                        ]}
                        onPress={() => toggleTag(tag.id)}
                      >
                        <Text style={[
                          styles.optionText,
                          localFilters.tagIds?.includes(tag.id) && styles.optionTextSelected,
                        ]}>
                          {tag.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Resetovať</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Použiť</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: 'white',
  },
  optionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionIcon: {
    fontSize: 14,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  optionTextSelected: {
    color: 'white',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'white',
  },
  resetButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
  },
  applyButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
})
