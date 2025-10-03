import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { pool } from './src/lib/db';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err?: any) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});

const gracefulShutdown = () => {
  console.log('Closing database connections...');
  pool.end((err: any) => {
    if (err) {
      console.error('Error closing database connections:', err);
      process.exit(1);
    }
    console.log('Database connections closed.');
    process.exit(0);
  });
};

// Listen for shutdown signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
