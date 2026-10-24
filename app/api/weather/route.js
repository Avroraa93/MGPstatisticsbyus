import { NextResponse } from 'next/server';
import { circuits } from '../../../lib/circuits';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('circuit') || 'phillip';
  const circuit = circuits[id];
  if (!circuit) return NextResponse.json({ error: 'Unknown circuit' }, { status: 400 });

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude: String(circuit.lat), longitude: String(circuit.lon),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,wind_speed_10m,wind_gusts_10m,weather_code',
    hourly: 'temperature_2m,precipitation_probability,precipitation,wind_speed_10m,wind_gusts_10m,relative_humidity_2m',
    forecast_days: '3', timezone: circuit.timezone, wind_speed_unit: 'kmh'
  }).toString();
  try {
    const response = await fetch(url, { next: { revalidate: 1800 } });
    if (!response.ok) throw new Error(`Weather provider returned ${response.status}`);
    const data = await response.json();
    return NextResponse.json({ circuit, source: 'Open-Meteo', fetchedAt: new Date().toISOString(), ...data }, {
      headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' }
    });
  } catch {
    return NextResponse.json({ error: 'Weather data is temporarily unavailable. Try again later.' }, { status: 502 });
  }
}
