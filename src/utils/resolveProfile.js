import { getMyCandidate } from '../api/candidates';
import { getMyRecruiter } from '../api/recruiters';
import { updateAuthUser } from './authState';

/**
 * After login, fetch the user's role profile to populate profileId / companyId
 * in local auth state. Silently ignored if the profile doesn't exist yet.
 */
export async function resolveProfile(frontendRole) {
  try {
    if (frontendRole === 'employee') {
      const profile = await getMyCandidate();
      updateAuthUser({ profileId: profile.id });
    } else if (frontendRole === 'employer') {
      const profile = await getMyRecruiter();
      updateAuthUser({ profileId: profile.id, companyId: profile.companyId ?? null });
    }
  } catch {
    // no profile created yet — that's fine
  }
}
