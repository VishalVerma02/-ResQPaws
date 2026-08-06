const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');
const SUCCESSSTORIES_FILE = path.join(DATA_DIR, 'successstories.json');

// Global DB State
const dbState = {
  dbType: 'json', // Default to JSON, switch to mongodb if connection succeeds
  isConnected: false,
  models: {}
};

// Seed Data
const getSeedUsers = () => {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('123456', salt);
  return [
    {
      _id: '645f7823f12a3b001c900001',
      name: 'Vishal Kumar',
      email: 'vishal@resqpaws.org',
      password: hashedPassword,
      role: 'reporter',
      volunteerDetails: { rating: 5.0, completedCount: 0, status: 'active' },
      createdAt: new Date('2025-05-01T10:00:00Z').toISOString()
    },
    {
      _id: '645f7823f12a3b001c900002',
      name: 'Rahul Singh',
      email: 'rahul@resqpaws.org',
      password: hashedPassword,
      role: 'volunteer',
      volunteerDetails: { rating: 4.8, completedCount: 15, status: 'active' },
      createdAt: new Date('2025-05-02T11:00:00Z').toISOString()
    },
    {
      _id: '645f7823f12a3b001c900003',
      name: 'Admin User',
      email: 'admin@resqpaws.org',
      password: hashedPassword,
      role: 'admin',
      volunteerDetails: { rating: 5.0, completedCount: 0, status: 'active' },
      createdAt: new Date('2025-05-03T12:00:00Z').toISOString()
    },
    {
      _id: '645f7823f12a3b001c900004',
      name: 'Happy Paws NGO',
      email: 'ngo@resqpaws.org',
      password: hashedPassword,
      role: 'ngo',
      ngoDetails: {
        registrationId: 'NGO-2026-9876',
        description: 'Working to rescue stray dogs, cats and cows across NCR region. Managing ambulance services and temporary shelters.',
        contactPhone: '+91 99999 88888'
      },
      createdAt: new Date('2025-05-04T12:00:00Z').toISOString()
    }
  ];
};

const getSeedReports = () => {
  return [
    {
      _id: '645f8934f12a3b001c900011',
      reporterId: '645f7823f12a3b001c900001',
      reporterName: 'Vishal Kumar',
      volunteerId: '645f7823f12a3b001c900002',
      volunteerName: 'Rahul Singh',
      animalType: 'Dog',
      condition: 'Injured on Roadside',
      location: 'M3 Road, Noida, Uttar Pradesh',
      address: 'Near Sector 62 Metro Station, Gate 2',
      description: 'Found a street dog hit by a car. It has a leg injury and cannot walk. Needs immediate medical attention.',
      imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
      priority: 'high',
      status: 'accepted',
      distance: '2.5 km away',
      reportedAt: new Date('2025-05-12T10:30:00Z').toISOString(),
      acceptedAt: new Date('2025-05-12T10:45:00Z').toISOString(),
      completedAt: null
    },
    {
      _id: '645f8934f12a3b001c900012',
      reporterId: '645f7823f12a3b001c900001',
      reporterName: 'Vishal Kumar',
      volunteerId: '645f7823f12a3b001c900002',
      volunteerName: 'Rahul Singh',
      animalType: 'Bird',
      condition: 'Broken Wing',
      location: 'Sector 15 Park, Noida, Uttar Pradesh',
      address: 'Inside central park near the water fountain',
      description: 'A pigeon is on the ground struggling to fly. Its left wing seems broken. Safe from predators for now but needs rescue.',
      imageUrl: 'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?auto=format&fit=crop&q=80&w=400',
      priority: 'medium',
      status: 'accepted',
      distance: '3.1 km away',
      reportedAt: new Date('2025-05-10T16:15:00Z').toISOString(),
      acceptedAt: new Date('2025-05-10T16:40:00Z').toISOString(),
      completedAt: null
    },
    {
      _id: '645f8934f12a3b001c900013',
      reporterId: '645f7823f12a3b001c900001',
      reporterName: 'Vishal Kumar',
      volunteerId: '645f7823f12a3b001c900002',
      volunteerName: 'Rahul Singh',
      animalType: 'Cow',
      condition: 'Injured Leg',
      location: 'Near City Center, Noida, Uttar Pradesh',
      address: 'Opposite City Center Mall, main road divider',
      description: 'A cow is sitting on the divider, limping badly. Appears to have been hit by a vehicle.',
      imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=400',
      priority: 'high',
      status: 'completed',
      distance: '5.6 km away',
      reportedAt: new Date('2025-05-08T11:30:00Z').toISOString(),
      acceptedAt: new Date('2025-05-08T12:00:00Z').toISOString(),
      completedAt: new Date('2025-05-08T15:30:00Z').toISOString()
    },
    {
      _id: '645f8934f12a3b001c900014',
      reporterId: '645f7823f12a3b001c900001',
      reporterName: 'Vishal Kumar',
      volunteerId: null,
      volunteerName: null,
      animalType: 'Cat',
      condition: 'Trapped / Sick',
      location: 'Sector 71, Noida, Uttar Pradesh',
      address: 'Inside pipeline near Block B',
      description: 'A small kitten is trapped in a storm water pipe. It is crying and looks malnourished.',
      imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
      priority: 'medium',
      status: 'reported',
      distance: '3.1 km away',
      reportedAt: new Date('2025-05-13T09:00:00Z').toISOString(),
      acceptedAt: null,
      completedAt: null
    }
  ];
};

const getSeedSuccessStories = () => {
  return [
    {
      _id: '645f9a23f12a3b001c900021',
      animalName: 'Bruno',
      beforeImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
      afterImage: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=400',
      description: 'Bruno was found on Noida Expressway with severe dehydration and leg fracture. NGO and volunteers rescued him, operated, and he has now been adopted by a loving family!',
      status: 'Adopted ❤️',
      authorName: 'Happy Paws NGO',
      createdAt: new Date('2025-06-01T12:00:00Z').toISOString()
    },
    {
      _id: '645f9a23f12a3b001c900022',
      animalName: 'Bella',
      beforeImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
      afterImage: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=400',
      description: 'Bella the kitten was trapped in a deep storm pipe for 2 days. Volunteers retrieved her and nurtured her. She is now healthy and adopted.',
      status: 'Adopted ❤️',
      authorName: 'Rahul Singh (Volunteer)',
      createdAt: new Date('2025-06-15T15:30:00Z').toISOString()
    }
  ];
};

// JSON Database Helper Methods
const readJSONFile = (filePath, defaultData) => {
  try {
    if (!fs.existsSync(filePath)) {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultData;
  }
};

const writeJSONFile = (filePath, data) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
  }
};

// Initialize JSON files
const initJSONDatabase = () => {
  readJSONFile(USERS_FILE, getSeedUsers());
  readJSONFile(REPORTS_FILE, getSeedReports());
  readJSONFile(SUCCESSSTORIES_FILE, getSeedSuccessStories());
  console.log('JSON database initialized successfully.');
};

// JSON-based Model Wrapper mimicking Mongoose
const makeJSONModel = (fileName, seedFunc) => {
  const getFilePath = () => {
    if (fileName === 'users') return USERS_FILE;
    if (fileName === 'reports') return REPORTS_FILE;
    return SUCCESSSTORIES_FILE;
  };

  return {
    find: async (query = {}) => {
      const items = readJSONFile(getFilePath(), seedFunc());
      return items.filter(item => {
        for (let key in query) {
          if (query[key] !== undefined && item[key] !== query[key]) {
            // Support simple regex or array filter checks
            if (typeof query[key] === 'object' && query[key] !== null) {
              if (query[key].$in && Array.isArray(query[key].$in)) {
                if (!query[key].$in.includes(item[key])) return false;
              } else if (query[key].$ne !== undefined) {
                if (item[key] === query[key].$ne) return false;
              }
            } else {
              return false;
            }
          }
        }
        return true;
      });
    },

    findOne: async (query = {}) => {
      const items = readJSONFile(getFilePath(), seedFunc());
      return items.find(item => {
        for (let key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      }) || null;
    },

    findById: async (id) => {
      const items = readJSONFile(getFilePath(), seedFunc());
      return items.find(item => item._id === id || item._id.toString() === id.toString()) || null;
    },

    create: async (data) => {
      const items = readJSONFile(getFilePath(), seedFunc());
      const newItem = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...data,
        createdAt: data.createdAt || new Date().toISOString()
      };
      items.push(newItem);
      writeJSONFile(getFilePath(), items);
      return newItem;
    },

    findByIdAndUpdate: async (id, update, options = {}) => {
      const items = readJSONFile(getFilePath(), seedFunc());
      const index = items.findIndex(item => item._id === id || item._id.toString() === id.toString());
      if (index === -1) return null;

      // Extract set updates or raw fields
      const updates = update.$set ? update.$set : update;
      items[index] = { ...items[index], ...updates };
      writeJSONFile(getFilePath(), items);
      return items[index];
    },

    countDocuments: async (query = {}) => {
      const items = readJSONFile(getFilePath(), seedFunc());
      return items.filter(item => {
        for (let key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      }).length;
    },

    deleteOne: async (query = {}) => {
      let items = readJSONFile(getFilePath(), seedFunc());
      const initialLength = items.length;
      items = items.filter(item => {
        for (let key in query) {
          if (item[key] === query[key]) return false;
        }
        return true;
      });
      writeJSONFile(getFilePath(), items);
      return { deletedCount: initialLength - items.length };
    }
  };
};

// Database Connection
const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/resqpaws';
  console.log(`Attempting to connect to MongoDB at: ${mongoURI}...`);

  try {
    // Attempt Mongoose connection (timeout after 3s)
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });

    dbState.dbType = 'mongodb';
    dbState.isConnected = true;
    console.log('MongoDB connected successfully!');

    // Import actual Mongoose models
    const User = require('../models/User');
    const Report = require('../models/Report');
    const SuccessStory = require('../models/SuccessStory');

    dbState.models.User = User;
    dbState.models.Report = Report;
    dbState.models.SuccessStory = SuccessStory;

    // Seed MongoDB if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('MongoDB User collection is empty. Seeding database...');
      const seedUsers = getSeedUsers();
      await User.insertMany(seedUsers);
      const seedReports = getSeedReports();
      await Report.insertMany(seedReports);
      const seedStories = getSeedSuccessStories();
      await SuccessStory.insertMany(seedStories);
      console.log('MongoDB seeded successfully.');
    }
  } catch (err) {
    console.warn('MongoDB connection failed. Falling back to local JSON database storage.');
    console.warn(`Error detail: ${err.message}`);

    dbState.dbType = 'json';
    dbState.isConnected = false;
    initJSONDatabase();

    // Map Mongoose-like methods to JSON files
    dbState.models.User = makeJSONModel('users', getSeedUsers);
    dbState.models.Report = makeJSONModel('reports', getSeedReports);
    dbState.models.SuccessStory = makeJSONModel('successstories', getSeedSuccessStories);
  }

  return dbState;
};

module.exports = {
  connectDB,
  dbState,
  getModels: () => dbState.models,
  getDbType: () => dbState.dbType
};
