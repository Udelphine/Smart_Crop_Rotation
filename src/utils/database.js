// src/utils/database.js
const { Sequelize } = require('sequelize');
const config = require('../../config/config');

class Database {
  constructor() {
    this.sequelize = null;
    this.connect();
  }

  connect() {
    try {
      // SQLite database file (creates it automatically)
      this.sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './database/crop_rotation.sqlite',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        define: {
          timestamps: true,
          underscored: true,
        },
      });

      // Test connection
      this.sequelize.authenticate()
        .then(() => {
          console.log('✅ SQLite database connected successfully');
          this.syncDatabase();
        })
        .catch(err => {
          console.error('❌ Database connection error:', err);
          process.exit(1);
        });
    } catch (error) {
      console.error('❌ Database setup error:', error);
      process.exit(1);
    }
  }

  async syncDatabase() {
    try {
      await this.sequelize.sync({ alter: true });
      console.log('✅ Database synced successfully');
    } catch (error) {
      console.error('❌ Database sync error:', error);
    }
  }

  getSequelize() {
    return this.sequelize;
  }
}

module.exports = new Database();