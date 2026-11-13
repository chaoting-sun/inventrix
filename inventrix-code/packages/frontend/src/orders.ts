import { pointPrice } from './points';

// shortcut: mocks the points side of checkout in the browser (real order + localStorage balance) until the backend's POST /api/orders returns points_spent/balance; set to false then.
const MOCK_ORDERS_API = true;

// Must match the key the points mock in points.ts reads.
const MOCK_BALANCE_KEY = 'mockPointsBalance';
const MOCK_ORDER_POINTS_KEY = 'mockOrderPoints';

export interface OrderItem {
  product_id: number;
  quantity: number;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const mockOrderPoints = (): Record<string, number> => JSON.parse(localStorage.getItem(MOCK_ORDER_POINTS_KEY) ?? '{}');

const postOrder = (token: string, items: OrderItem[]) =>
  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items }),
  });

export async function createOrder(token: string, items: OrderItem[]): Promise<Response> {
  if (!MOCK_ORDERS_API) return postOrder(token, items);

  if (!items.length || items.some(i => !Number.isInteger(i.quantity) || i.quantity <= 0)) {
    return json({ error: 'Quantity must be a positive integer' }, 400);
  }
  const products = await Promise.all(
    items.map(i => fetch(`/api/products/${i.product_id}`).then(res => (res.ok ? res.json() : null)))
  );
  if (products.some((p, k) => !p || p.stock < items[k].quantity)) return json({ error: 'Insufficient stock' }, 409);

  const pointsSpent = products.reduce((sum, p, k) => sum + pointPrice(p) * items[k].quantity, 0);
  const balance = Number(localStorage.getItem(MOCK_BALANCE_KEY) ?? 0);
  if (balance < pointsSpent) return json({ error: 'Insufficient points' }, 402);

  const res = await postOrder(token, items);
  if (!res.ok) return res;
  const { id } = await res.json();
  localStorage.setItem(MOCK_BALANCE_KEY, String(balance - pointsSpent));
  localStorage.setItem(MOCK_ORDER_POINTS_KEY, JSON.stringify({ ...mockOrderPoints(), [id]: pointsSpent }));
  return json({ id, points_spent: pointsSpent, balance: balance - pointsSpent }, 201);
}

export const orderPoints = (order: { id: number; points_spent?: number }) =>
  order.points_spent ?? (MOCK_ORDERS_API ? mockOrderPoints()[order.id] : undefined);
