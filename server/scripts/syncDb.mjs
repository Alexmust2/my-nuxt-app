import sequelize from '../db/index.js';

async function syncDb() {
  try {
    await sequelize.sync();
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to synchronize the database:', error);
  } finally {
    await sequelize.close();
  }
}

syncDb();