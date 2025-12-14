// app/(auth)/index.tsx
import { Link } from 'expo-router'
import { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, Platform, Image } from 'react-native'
import { useAuth } from '../../lib/viewmodels/useAuth'
import { theme } from '../../lib/theme'

const foodImages = [
  require('../../assets/foodimages/anna-tukhfatullina-food-photographer-stylist-Mzy-OjtCI70-unsplash.jpg'),
  require('../../assets/foodimages/casey-lee-awj7sRviVXo-unsplash.jpg'),
  require('../../assets/foodimages/eaters-collective-12eHC6FxPyg-unsplash.jpg'),
]

export default function AuthScreen() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const isWeb = Platform.OS === 'web'
  const { loginWithGoogle, loading } = useAuth()

  useEffect(() => {
    if (isWeb) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % foodImages.length)
      }, 4000)

      return () => clearInterval(interval)
    }
  }, [isWeb])

  const handleGoogleLogin = async () => {
    await loginWithGoogle()
  }

  const renderContent = () => (
    <View style={[styles.content, isWeb && styles.contentWeb]}>
      <View style={styles.hero}>
        <Text style={styles.title}>Recipe Swiper</Text>
<Text style={styles.subtitle}>Inšpirácia na každý deň</Text>
<Text style={styles.description}>
  Nájdite recept presne podľa chuti. Swipe. Ulož. Uvar.
</Text>
      </View>

      <View style={styles.buttons}>
        <Link href={"/(auth)/login" as any} asChild>
          <TouchableOpacity style={styles.buttonPrimary} activeOpacity={0.8}>
            <Text style={styles.buttonTextPrimary}>Prihlásiť sa</Text>
          </TouchableOpacity>
        </Link>

        <Link href={"/(auth)/register" as any} asChild>
          <TouchableOpacity style={styles.buttonSecondary} activeOpacity={0.8}>
            <Text style={styles.buttonTextSecondary}>Vytvoriť účet</Text>
          </TouchableOpacity>
        </Link>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>alebo</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.buttonGoogle}
          onPress={handleGoogleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          <View style={styles.googleIconContainer}>
            <Text style={styles.googleIcon}>G</Text>
          </View>
          <Text style={styles.buttonTextGoogle}>
            {loading ? 'Prihlasovanie...' : 'Pokračovať s Google'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  if (isWeb) {
    return (
      <View style={styles.containerWeb}>
        {/* Ľavá strana - obrázky */}
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
              Objavuj. Varí. Zdieľaj.
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
        
        {/* Pravá strana - auth formulár */}
        <View style={styles.authSection}>
          <Image
            source={require('../../assets/backgroud/orange_auth_backgroud.png')}
            style={styles.authBackground}
          />
          {renderContent()}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  )
}

const styles = StyleSheet.create({
  // Mobile container
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    fontSize: theme.typography.fontSize.xxxl,
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
  
  // Content (shared)
  content: {
    flex: 1,
    padding: theme.layout.contentPadding,
    justifyContent: 'space-between',
    maxWidth: theme.layout.contentMaxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  contentWeb: {
    maxWidth: theme.layout.contentMaxWidth,
    width: '100%',
    padding: theme.layout.webPadding,
  },
  
  // Hero
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: theme.typography.fontWeight.extraBold,
    color: theme.colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  description: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  
  // Buttons
  buttons: {
    gap: 14,
    paddingBottom: 40,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.button.paddingVertical,
    borderRadius: theme.button.borderRadius,
    shadowColor: theme.colors.primary,
    shadowOffset: theme.button.shadow.offset,
    shadowOpacity: theme.button.shadow.opacity,
    shadowRadius: theme.button.shadow.radius,
    elevation: 8,
  },
  buttonTextPrimary: {
    color: theme.colors.white,
    textAlign: 'center',
    fontSize: theme.button.fontSize,
    fontWeight: theme.typography.fontWeight.bold,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2.5,
    borderColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: theme.button.borderRadius,
  },
  buttonTextSecondary: {
    color: theme.colors.primary,
    textAlign: 'center',
    fontSize: theme.button.fontSize,
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: 20,
    color: theme.colors.textDisabled,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semiBold,
  },

  // Google Button
  buttonGoogle: {
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.border,
    paddingVertical: 18,
    borderRadius: theme.button.borderRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  googleIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  buttonTextGoogle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
})
