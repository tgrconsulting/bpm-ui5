import { redirect } from 'next/navigation';

export default function RootPage() {
  // This will instantly redirect users to /applications
  // as soon as they hit http://localhost:3000
  redirect('/dashboard');
}
