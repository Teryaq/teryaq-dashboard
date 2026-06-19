import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const TeryaqPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#E8F6F6',
      100: '#B8E4E6',
      200: '#88D2D6',
      300: '#58BFC6',
      400: '#28ADB6',
      500: '#0D7377',
      600: '#0B5F62',
      700: '#094B4E',
      800: '#07373A',
      900: '#052326',
      950: '#031214',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f8fafb',
          100: '#f1f5f5',
        },
      },
      dark: {
        surface: {
          0: '#1e1e1e',
          50: '#252526',
          100: '#2d2d30',
          200: '#3c3c3c',
        },
      },
    },
  },
});
