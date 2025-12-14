// app/(auth)/login.tsx
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

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationErrors, setValidationErrors] = useState<{email?: string, password?: string}>({})
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const isWeb = Platform.OS === 'web'

  const { login, loading, error } = useAuth()

  useEffect(() => {
    if (isWeb) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % foodImages.length)
      }, 4000)

      return () => clearInterval(interval)
    }
  }, [isWeb])

  const validateForm = () => {
    const errors: {email?: string, password?: string} = {}

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      errors.email = 'Email je povinný'
    } else if (!emailRegex.test(email)) {
      errors.email = 'Neplatný formát emailu'
    }

    if (!password) {
      errors.password = 'Heslo je povinné'
    } else if (password.length < 6) {
      errors.password = 'Heslo musí mať aspoň 6 znakov'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleLogin = async () => {
    if (!validateForm()) {
      return
    }

    const success = await login(email, password)
    if (success) {
      router.replace('/(tabs)/recipes' as any)
    } else if (error) {
      setValidationErrors({ email: 'Nesprávny email alebo heslo' })
    }
  }

  const renderForm = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, isWeb && styles.formContainer]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Vitaj späť!</Text>
          <Text style={styles.subtitle}>Prihlás sa do svojho účtu</Text>
        </View>

        {error && !validationErrors.email && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        <View style={styles.form}>
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
              placeholder="••••••••"
              placeholderTextColor="#999"
              value={password}
              onChangeText={(text) => {
                setPassword(text)
                setValidationErrors(prev => ({...prev, password: undefined}))
              }}
              secureTextEntry
              autoComplete="password"
            />
            {validationErrors.password && (
              <Text style={styles.fieldError}>{validationErrors.password}</Text>
            )}
          </View>

          <Link href={"/(auth)/forgot-password" as any} asChild>
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Zabudol si heslo?</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Prihlasovanie...' : 'Prihlásiť sa'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Nemáš účet? </Text>
            <Link href={"/(auth)/register" as any} asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Zaregistruj sa</Text>
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
              Tvoje recepty čakajú
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
    backgroundColor: theme.colors.primary,
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
    opacity: theme.opacity.overlay,
  },

  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.extraBold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.textPrimary,
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
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  fieldError: {
    color: theme.colors.primary,
    fontSize: 13,
    marginLeft: 4,
    marginTop: 4,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  errorContainer: {
    backgroundColor: theme.colors.primaryLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  errorText: {
    color: theme.colors.primary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.semiBold,
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
    backgroundColor: theme.colors.textDisabled,
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
    color: theme.colors.textSecondary,
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: theme.typography.fontWeight.bold,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
})
