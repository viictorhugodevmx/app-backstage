import { AccountScreen } from '@/components/account-screen';
import { getAuth0 } from '@/lib/auth0';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await getAuth0().getSession();

  const user = session
    ? {
        name:
          typeof session.user.name === 'string'
            ? session.user.name
            : 'Usuario de Backstage',
        email:
          typeof session.user.email === 'string'
            ? session.user.email
            : undefined,
      }
    : null;

  return <AccountScreen user={user} />;
}
