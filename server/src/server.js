require('dotenv').config();
const { createApp } = require('./app');
const { connectDatabase } = require('./config/db');

const port = process.env.PORT || 5000;

async function start() {
  await connectDatabase();
  const app = createApp();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
