// lib/theme.ts
// Centrálny súbor pre dizajn systém

export const theme = {
  // Colors
  colors: {
    // Backgrounds
    background: '#FFF8F0',
    white: '#FFFFFF',

    // Primary
    primary: '#FF6B35',
    primaryLight: '#FFE8E0',

    // Text
    textPrimary: '#2D3436',
    textSecondary: '#636E72',
    textDisabled: '#B2BEC3',

    // Borders
    border: '#E8E8E8',

    // Overlay
    overlay: 'rgba(0,0,0,0.7)',
    overlayLight: 'rgba(0,0,0,0.3)',
  },

  // Spacing
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Typography
  typography: {
    // Font Sizes
    fontSize: {
      xs: 13,
      sm: 14,
      md: 15,
      base: 16,
      lg: 17,
      xl: 18,
      xxl: 32,
      xxxl: 42,
    },
    // Font Weights
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semiBold: '600' as const,
      bold: '700' as const,
      extraBold: '800' as const,
    },
  },

  // Border Radius
  borderRadius: {
    sm: 12,
    md: 14,
    lg: 16,
  },

  // Input
  input: {
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    fontSize: 16,
  },

  // Button
  button: {
    borderRadius: 16,
    paddingVertical: 20,
    fontSize: 18,
    shadow: {
      offset: { width: 0, height: 8 },
      opacity: 0.35,
      radius: 16,
    },
  },

  // Layout (Web)
  layout: {
    contentMaxWidth: 500, // Môžeš jednoducho zmeniť šírku tu!
    contentPadding: 32,
    webPadding: 48,
  },

  // Opacity
  opacity: {
    disabled: 0.5,
    overlay: 0.25,
  },
}

export type Theme = typeof theme
