const API = process.env.REACT_APP_API_URL ?? 'http://localhost:5000';

export async function fetchCalories(query) {
  const r = await fetch(`${API}/lookup/calories?q=${encodeURIComponent(query)}`);
  if (!r.ok) throw new Error('Lookup failed');
  return r.json(); // { query, calories, items: [...] }
}
