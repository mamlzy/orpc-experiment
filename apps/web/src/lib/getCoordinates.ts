export async function getCoordinates(
  country: string
): Promise<[number, number] | null> {
  const cacheKey = `coords:${country}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  await new Promise((resolve) => {
    setTimeout(resolve, 500);
  });

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?country=${encodeURIComponent(country)}&format=json&limit=1`
    );

    if (!response.ok) {
      console.error('Geocoding error:', response.status);
      return null;
    }

    const result = await response.json();
    if (result.length === 0) return null;

    const lat = parseFloat(result[0].lat);
    const lon = parseFloat(result[0].lon);
    const coords: [number, number] = [lat, lon];

    localStorage.setItem(cacheKey, JSON.stringify(coords));
    return coords;
  } catch (error) {
    console.error('Failed to get coordinates:', error);
    return null;
  }
}
