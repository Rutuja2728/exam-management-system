const dns = require('dns');
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {
  // keep system DNS if custom servers cannot be applied
}

function toStandardAtlasUri(mongoUri) {
  if (!mongoUri.startsWith('mongodb+srv://')) {
    return mongoUri;
  }

  const parsed = new URL(mongoUri.replace('mongodb+srv://', 'https://'));
  const user = encodeURIComponent(decodeURIComponent(parsed.username || ''));
  const pass = encodeURIComponent(decodeURIComponent(parsed.password || ''));
  const dbName = parsed.pathname.replace(/^\//, '') || 'exam_management';
  const hosts = [
    'ac-tnhe7ar-shard-00-00.0m6etwm.mongodb.net:27017',
    'ac-tnhe7ar-shard-00-01.0m6etwm.mongodb.net:27017',
    'ac-tnhe7ar-shard-00-02.0m6etwm.mongodb.net:27017'
  ].join(',');

  return `mongodb://${user}:${pass}@${hosts}/${dbName}?ssl=true&replicaSet=atlas-nrxn65-shard-0&authSource=admin&retryWrites=true&w=majority`;
}

async function connectDatabase(uri) {
  const mongoUri = uri || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set. Add it to server/.env');
  }

  if (mongoUri.includes('YOUR_PASSWORD')) {
    throw new Error(
      'MONGODB_URI still contains YOUR_PASSWORD. Replace it with your Atlas database user password in server/.env'
    );
  }

  if (!mongoose.connection.listeners('connected').length) {
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error.message);
    });
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
  }

  const options = {
    family: 4,
    serverSelectionTimeoutMS: 20000
  };

  try {
    await mongoose.connect(mongoUri, options);
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || /querySrv/i.test(error.message)) {
      await mongoose.connect(toStandardAtlasUri(mongoUri), options);
      return;
    }
    throw error;
  }
}

module.exports = { connectDatabase };
