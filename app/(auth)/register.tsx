// app/(auth)/register.tsx
import { Link, router } from 'expo-router'
import { useState, useEffect } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, Image } from 'react-native'
import { useAuth } from '../../lib/viewmodels/useAuth'
import { theme } from '../../lib/theme'

const foodImages = [
  require('../../assets/foodimages/anna-tukhfatullina-food-photographer-stylist-Mzy-OjtCI70-unsplash.jpg'),
  require('../../assets/foodimages/casey-lee-awj7sRviVXo-unsplash.jpg'),
  require('../../assets/foodimages/eaters-collective-12eHC6FxPyg-unsplash.jpg'),
]

export default function RegisterScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationErrors, setValidationErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const isWeb = Platform.OS === 'web'

  const { register, loading, error } = useAuth()

  useEffect(() => {
    if (isWeb) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % foodImages.length)
      }, 4000)

      return () => clearInterval(interval)
    }
  }, [isWeb])

  const validateForm = () => {
    const errors: {
      name?: string
      email?: string
      password?: string
      confirmPassword?: string
    } = {}

    // Name validation
    if (!name) {
      errors.name = 'Meno je povinné'
    } else if (name.length < 2) {
      errors.name = 'Meno musí mať aspoň 2 znaky'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      errors.email = 'Email je povinný'
    } else if (!emailRegex.test(email)) {
      errors.email = 'Neplatný formát emailu'
    }

    // Password validation
    if (!password) {
      errors.password = 'Heslo je povinné'
    } else if (password.length < 6) {
      errors.password = 'Heslo musí mať aspoň 6 znakov'
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Potvrďte heslo'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Heslá sa nezhodujú'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleRegister = async () => {
    if (!validateForm()) {
      return
    }

    const success = await register(email, password, name)
    if (success) {
      // Presmerovanie na stránku s receptami po úspešnej registrácii
      router.replace('/(tabs)/recipes' as any)
    }
  }

  const renderForm = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, isWeb && styles.formContainer]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Vytvor si účet</Text>
          <Text style={styles.subtitle}>Začni objavovať nové recepty</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Meno</Text>
            <TextInput
              style={[styles.input, validationErrors.name && styles.inputError]}
              placeholder="Tvoje meno"
              placeholderTextColor="#999"
              value={name}
              onChangeText={(text) => {
                setName(text)
                setValidationErrors(prev => ({...prev, name: undefined}))
              }}
              autoComplete="name"
            />
            {validationErrors.name && (
              <Text style={styles.fieldError}>{validationErrors.name}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, validationErrors.email && styles.inputError]}
              placeholder="tvoj@email.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(text) => {
                setEmail(text)
                setValidationErrors(prev => ({...prev, email: undefined}))
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {validationErrors.email && (
              <Text style={styles.fieldError}>{validationErrors.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Heslo</Text>
            <TextInput
              style={[styles.input, validationErrors.password && styles.inputError]}
              placeholder="Aspoň 6 znakov"
              placeholderTextColor="#999"
              value={password}
              onChangeText={(text) => {
                setPassword(text)
                setValidationErrors(prev => ({...prev, password: undefined}))
              }}
              secureTextEntry
              autoComplete="password-new"
            />
            {validationErrors.password && (
              <Text style={styles.fieldError}>{validationErrors.password}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Potvrď heslo</Text>
            <TextInput
              style={[styles.input, validationErrors.confirmPassword && styles.inputError]}
              placeholder="Zadaj heslo znova"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text)
                setValidationErrors(prev => ({...prev, confirmPassword: undefined}))
              }}
              secureTextEntry
              autoComplete="password-new"
            />
            {validationErrors.confirmPassword && (
              <Text style={styles.fieldError}>{validationErrors.confirmPassword}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Vytváram účet...' : 'Zaregistrovať sa'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Už máš účet? </Text>
            <Link href={"/(auth)/login" as any} asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Prihlás sa</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )

  if (isWeb) {
    return (
      <View style={styles.containerWeb}>
        <View style={styles.imageSection}>
          {foodImages.map((image, index) => (
            <Image
              key={index}
              source={image}
              style={[
                styles.backgroundImage,
                {
                  opacity: currentImageIndex === index ? 1 : 0,
                  transition: 'opacity 1s ease-in-out',
                } as any,
              ]}
            />
          ))}
          <View style={[styles.imageOverlay, {
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
          } as any]}>
            <Text style={[styles.overlayTitle, {
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            } as any]}>
              Staň sa súčasťou komunity
            </Text>
            <View style={styles.dotsContainer}>
              {foodImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentImageIndex === index && styles.dotActive,
                    { transition: 'all 0.3s ease' } as any,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
        <View style={styles.authSection}>
          <Image
            source={require('../../assets/backgroud/orange_auth_backgroud.png')}
            style={styles.authBackground}
          />
          {renderForm()}
        </View>
      </View>
    )
  }

  return renderForm()
}

const styles = StyleSheet.create({
  // Mobile container
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    padding: theme.layout.contentPadding,
    justifyContent: 'center',
    maxWidth: theme.layout.contentMaxWidth,
    width: '100%',
    alignSelf: 'center',
  },

  // Web container
  containerWeb: {
    flex: 1,
    flexDirection: 'row',
  },

  // Ľavá strana - obrázky (web only)
  imageSection: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 40,
  },
  overlayTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#FF6B35',
    width: 30,
  },

  // Pravá strana (auth)
  authSection: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    position: 'relative',
  },
  authBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.25,
  },

  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#636E72',
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginLeft: 4,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: theme.input.borderWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.input.borderRadius,
    paddingVertical: theme.input.paddingVertical,
    paddingHorizontal: theme.input.paddingHorizontal,
    fontSize: theme.input.fontSize,
    color: theme.colors.textPrimary,
  },
  inputError: {
    borderColor: '#FF6B35',
    borderWidth: 2,
  },
  fieldError: {
    color: '#FF6B35',
    fontSize: 13,
    marginLeft: 4,
    marginTop: 4,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FFE8E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  errorText: {
    color: '#FF6B35',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.button.paddingVertical,
    borderRadius: theme.button.borderRadius,
    marginTop: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: theme.button.shadow.offset,
    shadowOpacity: theme.button.shadow.opacity,
    shadowRadius: theme.button.shadow.radius,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#B2BEC3',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: theme.colors.white,
    textAlign: 'center',
    fontSize: theme.button.fontSize,
    fontWeight: theme.typography.fontWeight.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 15,
    color: '#636E72',
  },
  linkText: {
    color: '#FF6B35',
    fontSize: 15,
    fontWeight: '700',
  },
})