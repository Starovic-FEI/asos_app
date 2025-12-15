process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://szucnjidivslauqefgmc.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_KEY = 'sb_publishable_UMZaole5BAejtMus_4LclA_cPoLVujq';

jest.unmock('expo');

jest.mock('expo-router', () => ({
  Stack: 'Stack',
  Tabs: 'Tabs',
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  Link: 'Link',
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    loadAsync: jest.fn(),
  },
}));

global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
