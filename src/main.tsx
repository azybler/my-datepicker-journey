import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@emotion/react';
import GlobalReset from './GlobalReset';
import GlobalTypography from './GlobalTypography';
import { theme } from './themes';
import App from './App';
import HiddenHeader from './HiddenHeader';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalReset />
      <GlobalTypography />
      <HiddenHeader />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
