export const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173',
  'https://real-time-collaboration-app-d8lx.onrender.com',
];

// Add production origins here when deploying
if (process.env.NODE_ENV === 'production') {
  // Add your production domains here
  allowedOrigins.push('https://real-time-collaboration-app-d8lx.onrender.com');
}
