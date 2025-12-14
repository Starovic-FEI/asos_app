// app/(tabs)/_layout.tsx
import { Stack } from 'expo-router'

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="recipes" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="recipe-detail" />
      <Stack.Screen name="recipe_create" />
    </Stack>
  )
}
