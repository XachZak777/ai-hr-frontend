const PROFILE_KEY_PREFIX = 'hireai_profile';

export const defaultProfiles = {
  admin: {
    name: '',
    email: '',
    phone: '',
    location: '',
    organization: '',
    headline: '',
    linkedin: '',
    skills: '',
    summary: '',
  },
  employer: {
    name: '',
    email: '',
    phone: '',
    location: '',
    organization: '',
    headline: '',
    linkedin: '',
    skills: '',
    summary: '',
  },
  employee: {
    name: '',
    email: '',
    phone: '',
    location: '',
    organization: '',
    headline: '',
    linkedin: '',
    skills: '',
    summary: '',
  },
};

export const defaultPreferences = {
  emailUpdates: true,
  applicationAlerts: true,
  weeklySummary: false,
};

export function getUserProfile(userRole = 'employee') {
  const defaults = defaultProfiles[userRole] || defaultProfiles.employee;

  try {
    const storedProfile = JSON.parse(localStorage.getItem(profileKey(userRole))) || {};
    return { ...defaults, ...storedProfile };
  } catch {
    return defaults;
  }
}

export function saveUserProfile(userRole = 'employee', profile) {
  localStorage.setItem(profileKey(userRole), JSON.stringify(profile));
  return profile;
}

export function getUserPreferences(userRole = 'employee') {
  try {
    const storedPreferences = JSON.parse(localStorage.getItem(preferencesKey(userRole))) || {};
    return { ...defaultPreferences, ...storedPreferences };
  } catch {
    return defaultPreferences;
  }
}

export function saveUserPreferences(userRole = 'employee', preferences) {
  localStorage.setItem(preferencesKey(userRole), JSON.stringify(preferences));
  return preferences;
}

function profileKey(userRole) {
  return `${PROFILE_KEY_PREFIX}_${userRole}`;
}

function preferencesKey(userRole) {
  return `${PROFILE_KEY_PREFIX}_${userRole}_preferences`;
}
