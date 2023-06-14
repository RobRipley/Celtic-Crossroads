const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

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
  composer: { type: String, required: true },
  fileUrl: { type: String, required: true },
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

app.post('/upload-tune', upload.single('tune'), async (req, res) => {
  const { title, composer } = req.body;
  const tuneFile = req.file;

  try {
    const tune = new Tune({
      title,
      composer,
      fileUrl: tuneFile.path,
    });

    await tune.save();

    res.status(201).json({ message: 'Tune uploaded successfully' });
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
