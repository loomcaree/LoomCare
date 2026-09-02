import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { InformationPage } from '@/components/information-page';
import '@/app/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InformationPage page="terms" />
  </StrictMode>,
);
