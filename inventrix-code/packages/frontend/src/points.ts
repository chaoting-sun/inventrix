// Set to true to demo the points flow in the browser without the backend points API.
const MOCK_POINTS_API = false;

const EARN_AMOUNT = 10;
const EARN_LIMIT = 3;
const EARN_WINDOW_MS = 10_000;
const MOCK_BALANCE_KEY = 'mockPointsBalance';
const mockEarnTimes: number[] = [];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const mockBalance = () => Number(localStorage.getItem(MOCK_BALANCE_KEY) ?? 0);

export function fetchBalance(token: string): Promise<Response> {
  if (MOCK_POINTS_API) return Promise.resolve(json({ balance: mockBalance() }));
  return fetch('/api/me/points', { headers: { Authorization: `Bearer ${token}` } });
}

export function earnPoints(token: string): Promise<Response> {
  if (MOCK_POINTS_API) {
    const now = Date.now();
    while (mockEarnTimes.length && now - mockEarnTimes[0] >= EARN_WINDOW_MS) mockEarnTimes.shift();
    if (mockEarnTimes.length >= EARN_LIMIT) return Promise.resolve(json({ error: 'Too many requests' }, 429));
    mockEarnTimes.push(now);
    const balance = mockBalance() + EARN_AMOUNT;
    localStorage.setItem(MOCK_BALANCE_KEY, String(balance));
    return Promise.resolve(json({ balance }));
  }
  return fetch('/api/points/earn', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
}
