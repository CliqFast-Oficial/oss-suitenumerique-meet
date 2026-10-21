import pandaPreset from '@pandacss/preset-panda'
import {
  Config,
  Tokens,
  defineConfig,
  defineSemanticTokens,
  defineTextStyles,
  defineTokens,
} from '@pandacss/dev'

const spacing: Tokens['spacing'] = {
  0: { value: '0rem' },
  0.125: { value: '0.125rem' },
  0.25: { value: '0.25rem' },
  0.375: { value: '0.375rem' },
  0.5: { value: '0.5rem' },
  0.625: { value: '0.625rem' },
  0.75: { value: '0.75rem' },
  1: { value: '1rem' },
  1.25: { value: '1.25rem' },
  1.5: { value: '1.5rem' },
  1.75: { value: '1.75rem' },
  2: { value: '2rem' },
  2.25: { value: '2.25rem' },
  2.5: { value: '2.5rem' },
  2.75: { value: '2.75rem' },
  3: { value: '3rem' },
  3.5: { value: '3.5rem' },
  4: { value: '4rem' },
}

const config: Config = {
  preflight: true,
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  jsxFramework: 'react',
  outdir: 'src/styled-system',
  globalFontface: {},
  theme: {
    ...pandaPreset.theme,
    // media queries are defined in em so that zooming with text-only mode triggers breakpoints
    breakpoints: {
      xs: '22.6em', // 360px (we assume less than that are old/entry level mobile phones)
      xsm: '31.25em', // 500px,
      sm: '40em', // 640px
      md: '48em', // 768px
      lg: '64em', // 1024px
      xl: '80em', // 1280px
      '2xl': '96em', // 1536px
    },
    keyframes: {
      slide: {
        from: {
          transform: 'var(--origin)',
          opacity: 0,
        },
        to: {
          transform: 'translateY(0)',
          opacity: 1,
        },
      },
      fade: { from: { opacity: 0 }, to: { opacity: 1 } },
      // Reunião CliqFast: entradas, o quadro de chamada da página inicial, a faixa de anotações e o ponto que pulsa.
      cfRise: {
        from: { opacity: 0, transform: 'translateY(14px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
      cfFloat: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-6px)' },
      },
      cfRing: {
        '0%': { boxShadow: '0 0 0 3px rgba(45, 205, 159, 1)' },
        '70%': { boxShadow: '0 0 0 12px rgba(45, 205, 159, 0)' },
        '100%': { boxShadow: '0 0 0 3px rgba(45, 205, 159, 1)' },
      },
      cfBars: {
        from: { transform: 'scaleY(0.35)' },
        to: { transform: 'scaleY(1)' },
      },
      cfType: {
        '0%': { transform: 'scaleX(0)', opacity: 1 },
        '35%, 80%': { transform: 'scaleX(1)', opacity: 1 },
        '100%': { transform: 'scaleX(1)', opacity: 0 },
      },
      cfBannerIn: {
        from: { opacity: 0, transform: 'translate(-50%, -8px)' },
        to: { opacity: 1, transform: 'translate(-50%, 0)' },
      },
      cfPulse: {
        '0%': { boxShadow: '0 0 0 0 rgba(45, 205, 159, 0.6)' },
        '70%': { boxShadow: '0 0 0 8px rgba(45, 205, 159, 0)' },
        '100%': { boxShadow: '0 0 0 0 rgba(45, 205, 159, 0)' },
      },
      pulse: {
        '0%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.7)' },
        '75%': { boxShadow: '0 0 0 30px rgba(255, 255, 255, 0)' },
        '100%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)' },
      },
      active_speaker: {
        '0%': { height: '25%' },
        '25%': { height: '45%' },
        '50%': { height: '20%' },
        '100%': { height: '55%' },
      },
      active_speaker_small: {
        '0%': { height: '20%' },
        '25%': { height: '25%' },
        '50%': { height: '18%' },
        '100%': { height: '25%' },
      },
      wave_hand: {
        '0%': { transform: 'rotate(0deg)' },
        '20%': { transform: 'rotate(-20deg)' },
        '80%': { transform: 'rotate(20deg)' },
        '100%': { transform: 'rotate(0)' },
      },
      pulse_background: {
        '0%': { opacity: '1' },
        '50%': { opacity: '0.65' },
        '100%': { opacity: '1' },
      },
      rotate: {
        '0%': {
          transform: 'rotate(0deg)',
        },
        '100%': {
          transform: 'rotate(360deg)',
        },
      },
      prixClipFix: {
        '0%': {
          clipPath: 'polygon(50% 50%, 0 0, 0 0, 0 0, 0 0, 0 0)',
        },
        '25%': {
          clipPath: 'polygon(50% 50%, 0 0, 100% 0, 100% 0, 100% 0, 100% 0)',
        },
        '50%': {
          clipPath:
            'polygon(50% 50%, 0 0, 100% 0, 100% 100%, 100% 100%, 100% 100%)',
        },
        '75%': {
          clipPath: 'polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 100%)',
        },
        '100%': {
          clipPath: 'polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 0)',
        },
      },
      overlayIn: {
        from: { opacity: 0 },
        to: { opacity: 0.6 },
      },
    },
    tokens: defineTokens({
      /* we take a few things from the panda preset but for now we clear out some stuff.
       * This way we'll only add the things we need step by step and prevent using lots of different things.
       */
      ...pandaPreset.theme.tokens,
      colors: defineTokens.colors({
        ...pandaPreset.theme.tokens.colors,
        // Reunião CliqFast: dentro da sala, marinho profundo; selecionado em verde-menta com texto marinho.
        primaryDark: {
          50: { value: '#050d22' },
          75: { value: '#0a1630' },
          100: { value: '#0f2045' },
          200: { value: '#16305f' },
          300: { value: '#1e3c75' },
          400: { value: '#2f55a0' },
          500: { value: '#5e80c8' },
          600: { value: '#8aa5dc' },
          700: { value: '#2dcd9f' },
          800: { value: '#7fe6c8' },
          900: { value: '#cff9e8' },
          950: { value: '#ebfdf6' },
          action: { value: '#67e3bb' },
        },
        // Azul-marinho da CliqFast (frontend/src/app/globals.css do produto).
        primary: {
          50: { value: '#eff4ff' },
          100: { value: '#dbe6fe' },
          200: { value: '#bed2fe' },
          300: { value: '#92b4fd' },
          400: { value: '#5e8bfa' },
          500: { value: '#3b66f6' },
          600: { value: '#2547eb' },
          700: { value: '#1d36d8' },
          800: { value: '#012461' },
          900: { value: '#011a46' },
          950: { value: '#010f2b' },
          action: { value: '#012461' },
        },
        // Verde-menta da CliqFast (destaque: falando, anotando, selecionado).
        mint: {
          50: { value: '#ebfdf6' },
          100: { value: '#cff9e8' },
          200: { value: '#a3f1d4' },
          300: { value: '#67e3bb' },
          400: { value: '#2dcd9f' },
          500: { value: '#01bd8c' },
          600: { value: '#009672' },
          700: { value: '#00785e' },
          800: { value: '#045f4c' },
        },
        greyscale: {
          '000': { value: '#FFFFFF' },
          50: { value: '#F6F6F6' },
          100: { value: '#EEEEEE' },
          200: { value: '#E5E5E5' },
          250: { value: '#DDDDDD' },
          300: { value: '#CECECE' },
          400: { value: '#929292' },
          500: { value: '#7C7C7C' },
          600: { value: '#666666' },
          700: { value: '#3A3A3A' },
          750: { value: '#353535' },
          800: { value: '#2A2A2A' },
          900: { value: '#242424' },
          950: { value: '#1E1E1E' },
          1000: { value: '#161616' },
        },
        error: {
          100: { value: '#261212' },
          200: { value: '#6C302E' },
          300: { value: '#983533' },
          400: { value: '#CA3632' },
          500: { value: '#EF413D' },
          600: { value: '#EE6A66' },
          700: { value: '#F28D8A' },
          800: { value: '#F6AFAD' },
          900: { value: '#FAD2D1' },
          950: { value: '#FFF4F4' },
        },
      }),
      animations: {},
      blurs: {},
      /* just directly use values as tokens. This allows us to follow a specific design scale,
       * without having to remember what 'sm' or '2xl' actually means.
       *
       * see semanticTokens for tokens targeting specific usages
       */
      fonts: {
        sans: {
          value: [
            '"Onest Variable"',
            'ui-sans-serif',
            'system-ui',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Noto Color Emoji"',
          ],
        },
        heading: {
          value: ['"Sora Variable"', '"Onest Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        },
        serif: {
          value: [
            'ui-serif',
            'Georgia',
            'Cambria',
            '"Times New Roman"',
            'Times',
            'serif',
          ],
        },
        mono: {
          value: [
            'Source Code Pro',
            'ui-monospace',
            'SFMono-Regular',
            'Menlo',
            'Monaco',
            'Consolas',
            '"Liberation Mono"',
            '"Courier New"',
            'monospace',
          ],
        },
      },
      fontSizes: {
        10: { value: '0.625rem' },
        12: { value: '0.75rem' },
        14: { value: '0.875rem' },
        16: { value: '1rem' },
        20: { value: '1.25rem' },
        24: { value: '1.5rem' },
        28: { value: '1.75rem' },
        32: { value: '2rem' },
        40: { value: '2.375rem' },
        48: { value: '3rem' },
        64: { value: '4rem' },
      },
      letterSpacings: {},
      shadows: {
        sm: {
          value: [
            '0 1px 3px 0 rgb(1 36 97 / 0.08)',
            '0 1px 2px -1px rgb(1 36 97 / 0.06)',
          ],
        },
        md: { value: '0 6px 16px -4px rgb(1 36 97 / 0.14)' },
        lg: { value: '0 18px 40px -12px rgb(1 36 97 / 0.24)' },
        mint: { value: '0 8px 24px -8px rgb(1 189 140 / 0.45)' },
      },
      lineHeights: {
        1: { value: '1' },
        1.25: { value: '1.25' },
        1.375: { value: '1.375' },
        1.5: { value: '1.5' },
        1.625: { value: '1.625' },
        2: { value: '2' },
      },
      // Cantos da CliqFast (6, 10, 14 e 22 px no site), um pouco mais suaves que os do original.
      radii: {
        4: { value: '0.5rem' },
        6: { value: '0.625rem' },
        8: { value: '0.875rem' },
        16: { value: '1.375rem' },
        full: { value: '9999px' },
      },
      sizes: {
        ...spacing,
        full: { value: '100%' },
        min: { value: 'min-content' },
        max: { value: 'max-content' },
        fit: { value: 'fit-content' },
        // room layout
        'room-side-panel': { value: '360px' },
        'room-side-panel-margin': { value: '1.5rem' },
        'room-control-bar': { value: '80px' },
        'room-reaction-toolbar-height': { value: '42px' },
        'tooltip-spacing': { value: '8px' },
      },
      spacing,
    }),
    semanticTokens: defineSemanticTokens({
      colors: {
        default: {
          text: { value: '{colors.greyscale.1000}' },
          bg: { value: 'white' },
          subtle: { value: '{colors.gray.100}' },
          'subtle-text': { value: '{colors.gray.600}' },
        },
        box: {
          text: { value: '{colors.default.text}' },
          bg: { value: '{colors.white}' },
          border: { value: '{colors.gray.300}' },
        },
        control: {
          DEFAULT: { value: '{colors.gray.100}' },
          hover: { value: '{colors.gray.200}' },
          active: { value: '{colors.gray.300}' },
          text: { value: '{colors.default.text}' },
          border: { value: '{colors.gray.500}' },
          subtle: { value: '{colors.gray.400}' },
        },
        primary: {
          DEFAULT: { value: '{colors.primary.800}' },
          hover: { value: '{colors.primary.900}' },
          active: { value: '{colors.primary.950}' },
          text: { value: '{colors.white}' },
          warm: { value: '{colors.primary.300}' },
          subtle: { value: '{colors.primary.100}' },
          'subtle-text': { value: '{colors.primary.800}' },
        },
        danger: {
          DEFAULT: { value: '{colors.red.600}' },
          hover: { value: '{colors.red.700}' },
          active: { value: '{colors.red.800}' },
          text: { value: '{colors.white}' },
          subtle: { value: '{colors.red.100}' },
          'subtle-text': { value: '{colors.red.700}' },
          ...pandaPreset.theme.tokens.colors.red,
        },
        alert: {
          DEFAULT: { value: '{colors.blue.700}' },
          notification: { value: '{colors.red.600}' },
        },
        success: {
          DEFAULT: { value: '{colors.green.700}' },
          hover: { value: '{colors.green.800}' },
          active: { value: '{colors.green.900}' },
          text: { value: '{colors.white}' },
          subtle: { value: '{colors.green.100}' },
          'subtle-text': { value: '{colors.green.800}' },
          ...pandaPreset.theme.tokens.colors.green,
        },
        warning: {
          DEFAULT: { value: '{colors.amber.700}' },
          hover: { value: '{colors.amber.800}' },
          active: { value: '{colors.amber.900}' },
          text: { value: '{colors.white}' },
          subtle: { value: '{colors.amber.100}' },
          'subtle-text': { value: '{colors.amber.700}' },
        },
        focusRing: { value: '#2547eb' },
      },
      shadows: {
        box: { value: '{shadows.sm}' },
      },
      spacing: {
        boxPadding: {
          DEFAULT: { value: '{spacing.2}' },
          sm: { value: '{spacing.1}' },
          xs: { value: '{spacing.0.5}' },
        },
        boxMargin: {
          xs: { value: '{spacing.0.5}' },
          DEFAULT: { value: '{spacing.1}' },
          lg: { value: '{spacing.2}' },
        },
        paragraph: { value: '{spacing.0.5}' },
        heading: { value: '{spacing.1}' },
        gutter: { value: '{spacing.1}' },
        textfield: { value: '{spacing.1}' },
      },
    }),
    textStyles: defineTextStyles({
      display: {
        value: {
          fontFamily: 'heading',
          letterSpacing: '-0.02em',
          fontSize: '3rem',
          lineHeight: '2rem',
          fontWeight: 700,
        },
      },
      h1: {
        value: {
          fontFamily: 'heading',
          letterSpacing: '-0.02em',
          fontSize: '1.5rem',
          lineHeight: '2rem',
          fontWeight: 700,
        },
      },
      h2: {
        value: {
          fontFamily: 'heading',
          letterSpacing: '-0.02em',
          fontSize: '1.25rem',
          lineHeight: '1.75rem',
          fontWeight: 700,
        },
      },
      h3: {
        value: {
          fontSize: '1.125rem',
          lineHeight: '1.75rem',
        },
      },
      body: {
        value: {
          fontSize: '1rem',
          lineHeight: '1.5',
        },
      },
      sm: {
        value: {
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
        },
      },
      xs: {
        value: {
          fontSize: '0.825rem',
          lineHeight: '1.15rem',
        },
      },
      badge: {
        value: {
          fontSize: '0.75rem',
          lineHeight: '1rem',
        },
      },
    }),
  },
}

export default defineConfig(config)
