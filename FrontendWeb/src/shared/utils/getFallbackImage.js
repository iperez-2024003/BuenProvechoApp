const FALLBACK_RESTAURANTS = [
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800',
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0f?q=80&w=800',
  'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800',
  'https://images.unsplash.com/photo-1466978913421-bac2e5e75149?q=80&w=800',
  'https://images.unsplash.com/photo-1502301103665-0b95cc738daf?q=80&w=800',
  'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800',
  'https://images.unsplash.com/photo-1552565530-7930c7c27cf0?q=80&w=800',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800',
  'https://images.unsplash.com/photo-1497644083578-611b798c60f0?q=80&w=800',
];

const FALLBACK_EVENTS = [
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=600',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=600',
];

const FALLBACK_MENU_ITEMS = [
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=400',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400',
  'https://images.unsplash.com/photo-1497644083578-611b798c60f0?q=80&w=400',
  'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=400',
  'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=400',
];

const hashId = (id) => {
  if (id === null || id === undefined) return 0;
  const str = String(id);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getFallbackRestaurant = (id) =>
  FALLBACK_RESTAURANTS[hashId(id) % FALLBACK_RESTAURANTS.length];

export const getFallbackEvent = (id) =>
  FALLBACK_EVENTS[hashId(id) % FALLBACK_EVENTS.length];

export const getFallbackMenuItem = (id) =>
  FALLBACK_MENU_ITEMS[hashId(id) % FALLBACK_MENU_ITEMS.length];
