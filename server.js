const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

mongoose.connect('mongodb://localhost:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  primaryInstrument: { type: String, required: true },
  tunebook: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tune' }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const tuneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  rhythm: { type: String, required: true },
  key: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);
const Tune = mongoose.model('Tune', tuneSchema);

app.use(express.json());

app.post('/register', async (req, res) => {
  try {
    const { username, password, name, location, primaryInstrument } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      name,
      location,
      primaryInstrument,
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Invalid credentials' });
    } else {
      const token = jwt.sign({ username: user.username }, 'secret-key');

      res.status(200).json({ token });
    }
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
});

app.get('/search-tunes', async (req, res) => {
  const { query } = req.query;

  try {
    const tunes = await Tune.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { rhythm: { $regex: query, $options: 'i' } },
        { key: { $regex: query, $options: 'i' } },
      ],
    });

    res.status(200).json({ tunes });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
});

app.post('/add-tune-to-tunebook', async (req, res) => {
  const { userId, tuneId } = req.body;

  try {
    const user = await User.findById(userId);
    const tune = await Tune.findById(tuneId);

    if (!user || !tune) {
      return res.status(404).json({ message: 'User or tune not found' });
    }

    user.tunebook.push(tune);
    await user.save();

    res.status(200).json({ message: 'Tune added to tunebook' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
});

app.post('/add-friend', async (req, res) => {
  const { userId, friendId } = req.body;

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: 'User or friend not found' });
    }

    user.friends.push(friend);
    await user.save();

    res.status(200).json({ message: 'Friend added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
