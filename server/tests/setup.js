const mongoose = require('mongoose');

// Set test environment
process.env.NODE_ENV = 'test';

// Global test setup
beforeAll(async () => {
  // Connect to test database
  await mongoose.connect('mongodb://127.0.0.1:27017/digital-event-passport-test');
});

// Global test teardown
afterAll(async () => {
  // Clean up and disconnect
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

// Clean up collections between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
}); 