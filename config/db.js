const { Sequelize } = require('sequelize');

const uri = process.env.POSTGRES_URI || 'postgres://postgres:postgres@localhost:5432/bisaf_db';

const sequelize = new Sequelize(uri, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: process.env.POSTGRES_SSL === 'true'
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connecté');
    await sequelize.sync({ alter: true });
  } catch (err) {
    console.error('Erreur PostgreSQL:', err);
    process.exit(1);
  }
};

module.exports = sequelize;
module.exports.connectDB = connectDB;
