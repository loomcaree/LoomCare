import { createRoot } from 'react-dom/client';
import { DashboardPage } from '@/components/dashboard-page';
import '@/app/globals.css';

createRoot(document.getElementById('root')!).render(<DashboardPage />);
