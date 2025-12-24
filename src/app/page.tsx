import { redirect } from 'next/navigation';

export default function Home() {
  // Simple redirect to login for now
  // In a real app, we'd check session here
  redirect('/login');
}
