import { redirect } from 'next/navigation';
import { FRONTEND_ROUTES } from '@/lib/constants';

export default function Home() {
  redirect(FRONTEND_ROUTES.DASHBOARD);
}
