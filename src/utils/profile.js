const PROFILE_KEY_PREFIX = 'hireai_profile';

export const defaultProfiles = {
  admin: {
    name: 'Admin User',
    email: 'admin@hireai.am',
    phone: '+374 00 000000',
    location: 'Yerevan, Armenia',
    organization: 'HireAI Armenia',
    headline: 'Platform administration and oversight',
    linkedin: '',
    skills: 'Platform operations, Analytics, Compliance',
    summary: 'Responsible for platform quality, reporting, and user support.',
  },
  employer: {
    name: 'Tech Armenia Team',
    email: 'hr@techarmenia.am',
    phone: '+374 00 000000',
    location: 'Yerevan, Armenia',
    organization: 'Tech Armenia',
    headline: 'Hiring team account',
    linkedin: '',
    skills: 'Recruiting, Team building, Technical hiring',
    summary: 'Hiring team focused on building strong engineering and product teams.',
  },
  employee: {
    name: 'Davit Harutyunyan',
    email: 'davit@example.am',
    phone: '+374 00 000000',
    location: 'Yerevan, Armenia',
    organization: 'Open to opportunities',
    headline: 'Frontend developer',
    linkedin: '',
    skills: 'React, JavaScript, CSS, HTML',
    summary: 'Frontend developer interested in fair, AI-assisted hiring opportunities.',
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
