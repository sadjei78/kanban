import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import KanbanBoard from './components/KanbanBoard';
import QRTest from './components/QRTest';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <KanbanBoard />
      <QRTest />
    </ThemeProvider>
  );
}

export default App;
