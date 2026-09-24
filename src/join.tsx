import { createRoot } from 'react-dom/client';
import { AuthPage } from '@/components/auth-page';
import '@/app/globals.css';

createRoot(document.getElementById('root')!).render(<AuthPage />);
