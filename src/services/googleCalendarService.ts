import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { CalendarEvent } from '../types';

// Firebase config comes from build-time env vars (see .env.example), never
// committed literally to the repo. Set these in .env.local for local dev.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  appId: process.env.FIREBASE_APP_ID || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
};

const isFirebaseConfigured = !!firebaseConfig.apiKey;
if (!isFirebaseConfigured) {
  console.warn('[googleCalendarService] Firebase não configurado (variáveis FIREBASE_* ausentes) — login com Google/sincronização de calendário ficará indisponível até configurar .env.local.');
}

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Calendar scopes
provider.addScope('https://www.googleapis.com/auth/calendar');
provider.addScope('https://www.googleapis.com/auth/calendar.events');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Load cached token from memory
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // If we don't have the cached token, we can trigger re-login or ask user
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Helper to parse dates and times
export function parseDateAndTime(dateStr: string, timeStr: string): Date {
  const baseDate = new Date(dateStr);
  let hours = 9;
  let minutes = 0;
  
  const timeClean = timeStr.trim().toUpperCase();
  const is12Hour = timeClean.includes('AM') || timeClean.includes('PM');
  
  if (is12Hour) {
    const match = timeClean.match(/(\d+):(\d+)\s*(AM|PM)/);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const meridian = match[3];
      if (meridian === 'PM' && hours < 12) {
        hours += 12;
      } else if (meridian === 'AM' && hours === 12) {
        hours = 0;
      }
    }
  } else {
    const parts = timeClean.split(':');
    if (parts.length >= 2) {
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
    }
  }
  
  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

// Fetch Google Calendar events
export const fetchGoogleEvents = async (accessToken: string, timeMin?: string): Promise<any[]> => {
  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.searchParams.append('singleEvents', 'true');
  url.searchParams.append('orderBy', 'startTime');
  if (timeMin) {
    url.searchParams.append('timeMin', timeMin);
  } else {
    // Default to last 30 days
    const past = new Date();
    past.setDate(past.getDate() - 30);
    url.searchParams.append('timeMin', past.toISOString());
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    if (res.status === 401) {
      cachedAccessToken = null;
    }
    const errText = await res.text();
    throw new Error(`Failed to fetch Google Calendar events: ${errText}`);
  }

  const data = await res.json();
  return data.items || [];
};

// Create an event on Google Calendar
export const createGoogleEvent = async (accessToken: string, event: Omit<CalendarEvent, 'id'>): Promise<string> => {
  const start = parseDateAndTime(event.date, event.time);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration default

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: event.title,
      description: `${event.description}\n\n[VitalSync Type: ${event.type}]`,
      start: {
        dateTime: start.toISOString(),
      },
      end: {
        dateTime: end.toISOString(),
      },
    }),
  });

  if (!res.ok) {
    if (res.status === 401) {
      cachedAccessToken = null;
    }
    const errText = await res.text();
    throw new Error(`Failed to create Google Calendar event: ${errText}`);
  }

  const data = await res.json();
  return data.id; // Returns Google's event ID
};

// Delete an event on Google Calendar
export const deleteGoogleEvent = async (accessToken: string, googleEventId: string): Promise<void> => {
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok && res.status !== 404) {
    if (res.status === 401) {
      cachedAccessToken = null;
    }
    const errText = await res.text();
    throw new Error(`Failed to delete Google Calendar event: ${errText}`);
  }
};
