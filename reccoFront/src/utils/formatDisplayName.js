export default function formatDisplayName(user) {
  if (!user) return 'Unknown user';
  const first = user.name || user.firstName || '';
  const last = user.surname || user.lastName || '';
  const full = [first, last].filter(Boolean).join(' ').trim();
  return full || user.email || 'Unknown user';
}

export function initials(user) {
  const name = formatDisplayName(user);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (name[0] || 'U').toUpperCase();
}

export function prettyInterestCode(code) {
  if (!code) return 'Interest';
  return String(code).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export const INTEREST_META = {
  BOOKS: { icon: '📚', accent: '#c45c26' },
  TV_SHOWS: { icon: '📺', accent: '#2f6f8f' },
  PODCASTS: { icon: '🎙️', accent: '#6b4c9a' },
  GAMES: { icon: '🎮', accent: '#2f7a4d' },
};
