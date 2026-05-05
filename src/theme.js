import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#5b5bd6',
      dark: '#4a4ab8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6b7280',
    },
    error:   { main: '#ef4444' },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    background: {
      default: '#faf7f2',
      paper:   '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, "BlinkMacSystemFont", "Segoe UI", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 4px rgba(0,0,0,0.05)',
    '0 2px 8px rgba(0,0,0,0.07)',
    '0 4px 12px rgba(0,0,0,0.08)',
    ...Array(21).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '14px',
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          background: '#5b5bd6',
          '&:hover': { background: '#4a4ab8' },
        },
        outlined: {
          borderColor: '#ede5d8',
          color: '#1e1b2e',
          '&:hover': {
            background: '#f5f0e8',
            borderColor: '#ddd0c0',
          },
        },
        sizeMedium: { padding: '8px 16px' },
        sizeSmall:  { padding: '5px 10px', fontSize: '12px' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            fontSize: '14px',
            backgroundColor: '#ffffff',
            '& fieldset':                { borderColor: '#ede5d8' },
            '&:hover fieldset':          { borderColor: '#5b5bd6' },
            '&.Mui-focused fieldset': {
              borderColor: '#5b5bd6',
              boxShadow: '0 0 0 2px rgba(91, 91, 214, 0.12)',
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '13px',
            fontWeight: 600,
            color: '#374151',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#5b5bd6',
          },
        },
      },
    },
  },
});

export default theme;
