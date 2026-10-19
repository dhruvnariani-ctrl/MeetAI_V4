
import { createTheme } from '@mui/material/styles'

export const COLORS = {
  navy: '#123A59',
  blue: '#0967B2',
  green: '#16815B',
  text: '#304858',
  muted: '#5A7189', // 5.3:1 on white (the old #71818D was 4.0:1)
  border: '#DFE7EC',
  background: '#F7F9FB',
  paper: '#FFFFFF',
  paleBlue: '#EFF6FB',
  paleGreen: '#F0F7F1',
  focus: '#0967B2',
  danger: '#B42318',
  warning: '#946200',
}

export const FONT = {
  small: '0.75rem',
  body2: '0.8125rem',
  body1: '0.875rem',
  subtitle1: '0.9375rem',
  h1: '1.5rem',
}

const theme = createTheme({
  palette: {
    primary: {
      main: COLORS.blue,
      dark: COLORS.navy,
      light: COLORS.paleBlue,
      contrastText: COLORS.paper,
    },
    secondary: {
      main: COLORS.green,
      light: COLORS.paleGreen,
      contrastText: COLORS.paper,
    },
    success: {
      main: COLORS.green,
      light: COLORS.paleGreen,
    },
    error: {
      main: COLORS.danger,
    },
    warning: {
      main: COLORS.warning,
    },
    text: {
      primary: COLORS.text,
      secondary: COLORS.muted,
    },
    background: {
      default: COLORS.background,
      paper: COLORS.paper,
    },
    divider: COLORS.border,
    brand: COLORS,
  },

  shape: {
    borderRadius: 8,
  },

  typography: {
    fontFamily: "'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",

    h1: {
      fontSize: FONT.h1,
      fontWeight: 700,
      lineHeight: 1.3,
      color: COLORS.navy,
      '@media (max-width:899.95px)': { fontSize: '1.25rem' }, // one title size per breakpoint on every page
    },
    h2: {
      fontSize: FONT.subtitle1,
      fontWeight: 700,
      lineHeight: 1.4,
      color: COLORS.navy,
    },
    h3: {
      fontSize: FONT.subtitle1,
      fontWeight: 600,
      lineHeight: 1.4,
      color: COLORS.navy,
    },
    h4: {
      fontSize: FONT.body1,
      fontWeight: 700,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: FONT.body1,
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: FONT.body1,
      fontWeight: 600,
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: FONT.subtitle1,
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: FONT.body2,
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: FONT.body1,
      lineHeight: 1.55,
    },
    body2: {
      fontSize: FONT.body2,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: FONT.small,
      lineHeight: 1.45,
    },
    button: {
      fontSize: FONT.body2,
      fontWeight: 600,
      textTransform: 'none',
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          minWidth: 320,
          WebkitTextSizeAdjust: '100%',
        },
        body: {
          backgroundColor: COLORS.background,
          color: COLORS.text,
        },
        '*': {
          boxSizing: 'border-box',
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            scrollBehavior: 'auto !important',
            transitionDuration: '0.01ms !important',
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
          },
        },
      },
    },

    MuiButtonBase: {
      styleOverrides: {
        root: {
          '&.Mui-focusVisible': {
            outline: `2px solid ${COLORS.focus}`,
            outlineOffset: 2,
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 36,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 12,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(18, 58, 89, 0.04)',
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: COLORS.paper,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: COLORS.border,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: COLORS.blue,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: COLORS.blue,
            borderWidth: 1,
          },
        },
        input: {
          fontSize: FONT.body2,
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: FONT.body2,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontSize: FONT.small,
          fontWeight: 600,
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: COLORS.paper,
          color: COLORS.navy,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8,
          boxShadow: '0 4px 14px rgba(18, 58, 89, 0.12)',
          fontSize: FONT.body2,
          fontWeight: 400,
          padding: '8px 12px',
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: COLORS.border,
          fontSize: FONT.body2,
        },
        head: {
          color: COLORS.navy,
          fontWeight: 700,
          backgroundColor: COLORS.paleBlue,
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
  },
})

export default theme
