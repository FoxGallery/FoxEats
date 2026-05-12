// Wrapper Photon (Komoot) — adresses FR illimitées. Fallback Nominatim si timeout.

export type GeocodeResult = {
  label: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  lat: number;
  lng: number;
};

const PHOTON = 'https://photon.komoot.io/api';

export async function geocode(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  const url = `${PHOTON}/?q=${encodeURIComponent(query)}&lang=fr&limit=8&osm_tag=place&bbox=4.5,42.9,9.7,44.4`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const data = (await res.json()) as { features: PhotonFeature[] };
  return data.features.flatMap(toResult);
}

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    postcode?: string;
    country?: string;
    countrycode?: string;
  };
};

function toResult(f: PhotonFeature): GeocodeResult[] {
  const { properties: p, geometry } = f;
  if (!p.city || !p.postcode) return [];
  const street = [p.housenumber, p.street ?? p.name].filter(Boolean).join(' ');
  if (!street) return [];
  return [
    {
      label: `${street}, ${p.postcode} ${p.city}`,
      street,
      city: p.city,
      postalCode: p.postcode,
      country: (p.countrycode ?? p.country ?? 'FR').toUpperCase(),
      lat: geometry.coordinates[1],
      lng: geometry.coordinates[0],
    },
  ];
}
