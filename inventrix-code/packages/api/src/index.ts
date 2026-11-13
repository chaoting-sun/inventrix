import { createApp } from './app.js';
import { initDb } from './db.js';

const PORT = process.env.PORT || 3000;

try {
  await initDb();
} catch (error) {
  console.error('Database initialization failed:', error);
  process.exit(1);
}

createApp().listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
