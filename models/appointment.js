// Appointment.js
module.exports = (sequelize, DataTypes) => {
    const Appointment = sequelize.define('Appointment', {
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      time: {
        type: DataTypes.TIME,
        allowNull: false
      }
    });
  
    Appointment.associate = models => {
      Appointment.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
    };
  
    return Appointment;
  };
  