const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const app = express();
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

// Import Sequelize models
const User = require('./models/user')(sequelize, DataTypes);
const Appointment = require('./models/appointment')(sequelize, DataTypes);

app.use(express.json());

// Middleware for user authentication
const authenticateUser = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    req.user = user; // Attach user object to request
    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Routes

// Welcome message
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the appointment booking API!' });
});

// Login route
app.post('/login', authenticateUser, (req, res) => {
  res.status(200).json({ message: 'Login successful', user: req.user });
});

// Endpoint to create a new user
app.post('/users', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash the password before saving to database
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds

    // Create user
    const newUser = await User.create({ username, password: hashedPassword });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Endpoint to create a new appointment
app.post('/appointments', async (req, res) => {
  const { date, time, userId } = req.body;

  try {
    // Create appointment
    const newAppointment = await Appointment.create({ date, time, userId });

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Endpoint to retrieve appointments for a specific user
app.get('/users/:userId/appointments', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Find appointments for the user
    const appointments = await Appointment.findAll({ where: { userId } });

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Initialize Sequelize and start server
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Sync models with database
    await User.sync({ alter: true });
    await Appointment.sync({ alter: true });

    console.log('All models were synchronized successfully.');

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();
