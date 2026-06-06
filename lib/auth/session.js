import { cookies } from 'next/headers';
import { getUserById } from '@/lib/db/users';
import { SESSION_COOKIE } from '@/lib/auth/constants';

export { SESSION_COOKIE, SESSION_MAX_AGE, roleHome } from '@/lib/auth/constants';

// Baca user dari cookie session (berisi user id) → lookup DB lokal.
// Return { id, full_name, email, role, ... } atau null.
export async function getCurrentUser() {
  const id = cookies().get(SESSION_COOKIE)?.value;
  if (!id) return null;
  return getUserById(id);
}
