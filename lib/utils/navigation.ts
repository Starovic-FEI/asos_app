import { router } from 'expo-router'

export const safeGoBack = () => {
  try {
    if (typeof (router as any).canGoBack === 'function') {
      if ((router as any).canGoBack()) {
        router.back()
      } else {
        router.replace('/(tabs)/recipes' as any)
      }
    } else {
      router.back()
    }
  } catch (error) {
    console.warn('Navigation back failed, redirecting to recipes:', error)
    router.replace('/(tabs)/recipes' as any)
  }
}

