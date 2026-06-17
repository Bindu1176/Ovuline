import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

document.documentElement.classList.remove('dark');
document.body.classList.remove('dark');
document.documentElement.style.colorScheme = 'light';
document.body.style.colorScheme = 'light';

document.documentElement.style.background = 'linear-gradient(180deg, #FFF8FA 0%, #FFEFF3 100%)';
document.body.style.background = 'linear-gradient(180deg, #FFF8FA 0%, #FFEFF3 100%)';

document.documentElement.style.color = '#4A2B2E';
document.body.style.color = '#4A2B2E';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
