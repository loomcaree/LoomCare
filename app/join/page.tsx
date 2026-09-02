import type { Metadata } from 'next';
import { JoinWaitlistPage } from '@/components/join-waitlist-page';

export const metadata: Metadata = {
  title: 'Join the First Circle — Loom Care',
  description: 'Step into peace of mind. A simple pendant that notices falls, remembers medicines, and brings family closer.',
};

export default function JoinPage() {
  return <JoinWaitlistPage />;
}
