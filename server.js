const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

mongoose.connect('mongodb://localhost:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  tunebook: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tune' }],
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
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, password: hashedPassword });
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
      res.status(404).json({ message: 'User or tune not found' });
    } else {
      user.tunebook.push(tune);
      await user.save();

      res.status(200).json({ message: 'Tune added to tunebook' });
    }
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
});

// Function to read .abc files from a directory and save tunes to the database
const readABCFiles = async () => {
  const abcDirectory = '/Users/robertripley/code_projects/celtic-crossroads/tuneABCs';

  try {
    const files = fs.readdirSync(abcDirectory);

    for (const file of files) {
      const filePath = path.join(abcDirectory, file);
      const fileData = fs.readFileSync(filePath, 'utf-8');
      const lines = fileData.split('\n');

      const title = lines[1].substring(3).trim();
      const rhythm = lines[4].substring(3).trim();
      const key = lines[6].substring(3).trim();

      const tune = new Tune({ title, rhythm, key });
      await tune.save();
    }

    console.log('Tunes added to the database');
  } catch (error) {
    console.error('Error reading ABC files:', error);
  }
};

// Call the function to read ABC files and save tunes to the database
readABCFiles();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
