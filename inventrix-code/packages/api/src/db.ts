import pg, { PoolClient, QueryResultRow } from 'pg';
import bcrypt from 'bcrypt';

let pool: pg.Pool | undefined;

const getPool = (): pg.Pool => {
  if (pool) {
    return pool;
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
  }
  pool = new pg.Pool({ connectionString });
  pool.on('error', (error) => {
    console.error('PostgreSQL idle client error:', error);
  });
  return pool;
};

export const query = async <T extends QueryResultRow = any>(text: string, params: unknown[] = []) => {
  return getPool().query<T>(text, params);
};

export const withTransaction = async <T>(fn: (client: PoolClient) => Promise<T>): Promise<T> => {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Transaction rollback failed:', rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
};

export const closeDb = async () => {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
};

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'customer')),
    points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DOUBLE PRECISION NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    subtotal DOUBLE PRECISION NOT NULL,
    gst DOUBLE PRECISION NOT NULL,
    total DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    points_spent INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DOUBLE PRECISION NOT NULL
  );

  ALTER TABLE users ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS points_spent INTEGER NOT NULL DEFAULT 0;
`;

const SEED_PRODUCTS: [string, string, number, number, string][] = [
  ['Laptop Pro 15"', 'High-performance laptop with 16GB RAM', 1299.99, 25, '/images/laptop.png'],
  ['Wireless Mouse', 'Ergonomic wireless mouse with precision tracking', 29.99, 150, '/images/wireless-mouse.png'],
  ['Mechanical Keyboard', 'RGB backlit mechanical keyboard', 89.99, 75, '/images/mechanical-keyboard.png'],
  ['USB-C Hub', '7-in-1 USB-C hub with HDMI and card reader', 49.99, 100, '/images/usb-hub.png'],
  ['Webcam HD', '1080p HD webcam with auto-focus', 79.99, 60, '/images/webcam.png'],
  ['Monitor 27" 4K', 'Ultra HD 4K monitor with HDR support', 449.99, 40, '/images/monitor.png'],
  ['Desk Lamp LED', 'Adjustable LED desk lamp with touch control', 39.99, 120, '/images/desk-lamp.png'],
  ['Headphones Wireless', 'Noise-cancelling wireless headphones', 199.99, 85, '/images/headphones.png'],
  ['External SSD 1TB', 'Portable solid state drive with USB 3.2', 129.99, 95, '/images/external-ssd.png'],
  ['Laptop Stand', 'Aluminum laptop stand with cooling', 54.99, 110, '/images/laptop-stand.png'],
  ['Tablet 10"', 'Android tablet with stylus support', 349.99, 65, '/images/tablet.png'],
  ['Wireless Charger', 'Fast wireless charging pad 15W', 34.99, 140, '/images/wireless-charger.png'],
  ['Smartwatch', 'Fitness tracking smartwatch with GPS', 249.99, 70, '/images/smartwatch.png'],
  ['Bluetooth Speaker', 'Waterproof portable speaker', 69.99, 90, '/images/bluetooth-speaker.png'],
  ['Smartphone', '5G smartphone with triple camera', 799.99, 50, '/images/smartphone.png'],
  ['Gaming Mouse Pad', 'Extended RGB gaming mouse pad', 24.99, 130, '/images/gaming-mousepad.png'],
  ['Cable Organizer', 'Desktop cable management system', 19.99, 200, '/images/cable-organizer.png'],
  ['Phone Case', 'Protective phone case with kickstand', 14.99, 180, '/images/phone-case.png'],
  ['Screen Protector', 'Tempered glass screen protector', 9.99, 250, '/images/screen-protector.png'],
  ['Power Bank 20000mAh', 'High-capacity portable charger', 44.99, 105, '/images/power-bank.png'],
  ['Gaming Controller', 'Wireless gaming controller with haptic feedback', 59.99, 80, '/images/gaming-controller.png'],
  ['Network Router', 'Dual-band WiFi 6 router with high-speed connectivity', 129.99, 55, '/images/network-router.png'],
  ['Tablet 10"', '10-inch tablet with stylus support and HD display', 299.99, 45, '/images/tablet-10-inch.png'],
  ['Laser Printer', 'Wireless laser printer with duplex printing', 249.99, 35, '/images/laser-printer.png']
];

const INSERT_USER_SQL = 'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)';

const seedDefaultData = async (client: PoolClient) => {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  await client.query(INSERT_USER_SQL, ['admin@inventrix.com', adminPassword, 'Admin User', 'admin']);
  await client.query(INSERT_USER_SQL, ['customer@inventrix.com', customerPassword, 'Customer User', 'customer']);

  for (const product of SEED_PRODUCTS) {
    await client.query(
      'INSERT INTO products (name, description, price, stock, image_url) VALUES ($1, $2, $3, $4, $5)',
      product
    );
  }
};

const INIT_DB_LOCK_KEY = 4207;

export const initDb = async () => {
  await withTransaction(async (client) => {
    // Concurrent CREATE TABLE IF NOT EXISTS can fail in PostgreSQL, so processes take turns here.
    await client.query('SELECT pg_advisory_xact_lock($1)', [INIT_DB_LOCK_KEY]);
    await client.query(SCHEMA_SQL);
    const { rows } = await client.query<{ count: number }>('SELECT COUNT(*)::int AS count FROM users');
    if (rows[0].count === 0) {
      await seedDefaultData(client);
    }
  });
};
