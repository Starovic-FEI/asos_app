// lib/utils/alert.ts
import { Alert, Platform } from 'react-native'

interface AlertButton {
  text: string
  onPress?: () => void
  style?: 'default' | 'cancel' | 'destructive'
}

/**
 * Cross-platform alert that works on web (Vercel) and native (iOS/Android)
 */
export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[]
) => {
  if (Platform.OS === 'web') {
    // Web implementation using browser APIs
    const fullMessage = message ? `${title}\n\n${message}` : title
    
    if (!buttons || buttons.length === 0) {
      // Simple alert
      window.alert(fullMessage)
      return
    }

    if (buttons.length === 1) {
      // Single button alert
      window.alert(fullMessage)
      buttons[0].onPress?.()
      return
    }

    if (buttons.length === 2) {
      // Confirmation dialog (Yes/No, OK/Cancel)
      const confirmed = window.confirm(fullMessage)
      if (confirmed) {
        // Find non-cancel button (usually the second one or the destructive one)
        const actionButton = buttons.find(b => b.style !== 'cancel') || buttons[1]
        actionButton.onPress?.()
      } else {
        // Find cancel button
        const cancelButton = buttons.find(b => b.style === 'cancel') || buttons[0]
        cancelButton.onPress?.()
      }
      return
    }

    // Multiple buttons - just show alert with message and call first button's action
    window.alert(fullMessage)
    buttons[0]?.onPress?.()
  } else {
    // Native implementation
    Alert.alert(title, message, buttons)
  }
}

/**
 * Simple alert with just OK button
 */
export const showSimpleAlert = (title: string, message?: string) => {
  showAlert(title, message, [{ text: 'OK' }])
}

/**
 * Confirmation dialog with Cancel and Confirm buttons
 */
export const showConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText: string = 'OK',
  cancelText: string = 'Zrušiť'
) => {
  showAlert(title, message, [
    {
      text: cancelText,
      style: 'cancel',
      onPress: onCancel
    },
    {
      text: confirmText,
      style: 'destructive',
      onPress: onConfirm
    }
  ])
}
