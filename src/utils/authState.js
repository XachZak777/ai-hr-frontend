const AUTH_USER_KEY = 'hireai_auth_user';

// Backend ↔ frontend role mapping
export const FRONTEND_ROLE = {
  CANDIDATE: 'employee',
  RECRUITER: 'employer',
  ADMIN:     'admin',
};

export const BACKEND_ROLE = {
  employee: 'CANDIDATE',
  employer: 'RECRUITER',
  admin:    'ADMIN',
};

/**
 * Stored shape:
 * { userId, email, fullName, backendRole, profileId, companyId }
 *
 * profileId — candidate / recruiter / admin profile ID (distinct from userId).
 *             Populated after POST /candidates (or /recruiters / /admins).
 * companyId — populated after recruiter profile is fetched (RecruiterDto.companyId).
 */
export function getAuthUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_USER_KEY)); } catch { return null; }
}

export function setAuthUser(user) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function updateAuthUser(patch) {
  setAuthUser({ ...(getAuthUser() ?? {}), ...patch });
}

export function clearAuthUser() {
  localStorage.removeItem(AUTH_USER_KEY);
}

/** Convert a raw AuthResponse from the backend into the local auth user shape. */
export function parseAuthResponse(data) {
  return {
    userId:      data.id,
    email:       data.email,
    fullName:    data.fullName ?? '',
    backendRole: data.role,   // CANDIDATE | RECRUITER | ADMIN
    profileId:   null,        // set after profile creation / fetch
    companyId:   null,        // set after recruiter profile fetch
  };
}

/** Frontend role string ('employee' | 'employer' | 'admin') from stored auth user. */
export function getFrontendRole() {
  const user = getAuthUser();
  return user ? (FRONTEND_ROLE[user.backendRole] ?? null) : null;
}

/** Display name for the nav bar — prefers fullName, falls back to email local-part. */
export function getDisplayName() {
  const user = getAuthUser();
  if (!user) return '';
  return user.fullName || user.email.split('@')[0];
}
