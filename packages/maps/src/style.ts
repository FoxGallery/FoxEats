// Style MapLibre — fond clair "Méditerranée" via MapTiler.
// Le key public peut être restreint par domaine côté MapTiler.

export const FOXEATS_LIGHT_STYLE = (maptilerKey: string) =>
  `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`;

export const FOXEATS_DARK_STYLE = (maptilerKey: string) =>
  `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${maptilerKey}`;

// Centres par défaut Côte d'Azur
export const RIVIERA_CITY_CENTERS = {
  nice: { lat: 43.7102, lng: 7.262 },
  cannes: { lat: 43.5528, lng: 7.0174 },
  antibes: { lat: 43.5808, lng: 7.1239 },
  monaco: { lat: 43.7384, lng: 7.4246 },
  menton: { lat: 43.7765, lng: 7.5036 },
  'saint-tropez': { lat: 43.2727, lng: 6.6407 },
  'cagnes-sur-mer': { lat: 43.6634, lng: 7.1488 },
  grasse: { lat: 43.6584, lng: 6.9237 },
} as const;
