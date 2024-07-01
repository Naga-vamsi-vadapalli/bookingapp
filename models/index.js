const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./user')(sequelize, Sequelize);
db.appointment = require('./appointment')(sequelize, Sequelize);

// Define relationships
db.User.hasMany(db.Appointment, { as: 'appointments' });
db.Appointment.belongsTo(db.User, {
  foreignKey: 'userId',
  as: 'user',
});

module.exports = db;
