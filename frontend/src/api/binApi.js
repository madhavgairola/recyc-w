const API_BASE = 'http://localhost:5000/api';

export const fetchBins = async () => {
  const res = await fetch(`${API_BASE}/bins`);
  if (!res.ok) throw new Error('Failed to fetch bins');
  return res.json();
};

export const fetchCriticalBins = async () => {
  const res = await fetch(`${API_BASE}/bins/critical`);
  if (!res.ok) throw new Error('Failed to fetch critical bins');
  return res.json();
};

export const fetchOptimizedRoute = async () => {
  const res = await fetch(`${API_BASE}/bins/optimize-route`);
  if (!res.ok) throw new Error('Failed to fetch optimized route');
  return res.json();
};
