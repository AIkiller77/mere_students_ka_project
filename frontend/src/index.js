import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Web3Provider } from './contexts/Web3Context';

// Define the Chakra UI theme
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f7ff',
      100: '#b3e0ff',
      200: '#80caff',
      300: '#4db3ff',
      400: '#1a9dff',
      500: '#0087e6',
      600: '#0069b3',
      700: '#004c80',
      800: '#002e4d',
      900: '#00101a',
    },
    secondary: {
      50: '#e6fff9',
      100: '#b3ffed',
      200: '#80ffe2',
      300: '#4dffd6',
      400: '#1affca',
      500: '#00e6b3',
      600: '#00b38c',
      700: '#008066',
      800: '#004d3d',
      900: '#001a14',
    },
  },
  fonts: {
    heading: 'Roboto, sans-serif',
    body: 'Inter, sans-serif',
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <Web3Provider>
            <App />
          </Web3Provider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
