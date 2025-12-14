// app/index.tsx
import { Redirect } from 'expo-router'
import { useAuth } from '../lib/viewmodels/useAuth'
import { View, Text, StyleSheet } from 'react-native'

export default function Index() {
  const { isLoggedIn, loading } = useAuth()

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Načítavam...</Text>
      </View>
    )
  }

  // Ak je prihlásený, presmerujem na vytvorenie receptu
  if (isLoggedIn) {
    return <Redirect href={"/(tabs)/recipe_create" as any} />
  }

  // Ak nie je prihlásený, presmerujem na auth
  return <Redirect href={"/(auth)" as any} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
})