import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [primaryInstrument, setPrimaryInstrument] = useState('');
  const [token, setToken] = useState('');
  const [tuneSearchQuery, setTuneSearchQuery] = useState('');
  const [tuneSearchResults, setTuneSearchResults] = useState([]);
  const [tunebook, setTunebook] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    // Fetch tunebook and friends data after login or registration
    if (token) {
      fetchTunebook();
      fetchFriends();
    }
  }, [token]);

  const registerUser = async () => {
    try {
      await axios.post('http://localhost:3000/register', {
        username,
        password,
        name,
        location,
        primaryInstrument,
      });
      console.log('User registered successfully');
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  const loginUser = async () => {
    try {
      const response = await axios.post('http://localhost:3000/login', {
        username,
        password,
      });
      setToken(response.data.token);
      console.log('User logged in successfully');
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const searchTunes = async () => {
    try {
      const response = await axios.get('http://localhost:3000/search-tunes', {
        params: { query: tuneSearchQuery },
      });
      setTuneSearchResults(response.data.tunes);
    } catch (error) {
      console.error('Error searching tunes:', error);
    }
  };

  const addTuneToTunebook = async (tuneId) => {
    try {
      await axios.post('http://localhost:3000/add-tune-to-tunebook', {
        userId: token, // Assuming the user ID is stored in the token
        tuneId,
      });
      console.log('Tune added to tunebook');
      fetchTunebook(); // Refresh tunebook after adding a tune
    } catch (error) {
      console.error('Error adding tune to tunebook:', error);
    }
  };

  const fetchTunebook = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/user/${token}/tunebook`);
      setTunebook(response.data.tunebook);
    } catch (error) {
      console.error('Error fetching tunebook:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/user/${token}/friends`);
      setFriends(response.data.friends);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  return (
    <div>
      {/* User Registration */}
      <h2>Register</h2>
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
      <input type="text" placeholder="Primary Instrument" value={primaryInstrument} onChange={(e) => setPrimaryInstrument(e.target.value)} />
      <button onClick={registerUser}>Register</button>

      {/* User Login */}
      <h2>Login</h2>
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={loginUser}>Login</button>

      {/* Tune Search */}
      <h2>Tune Search</h2>
      <input type="text" placeholder="Search Tunes" value={tuneSearchQuery} onChange={(e) => setTuneSearchQuery(e.target.value)} />
      <button onClick={searchTunes}>Search</button>
      <ul>
        {tuneSearchResults.map((tune) => (
          <li key={tune.id}>
            {tune.title} - {tune.rhythm} - {tune.key}
            <button onClick={() => addTuneToTunebook(tune.id)}>Add to Tunebook</button>
          </li>
        ))}
      </ul>

      {/* Tunebook */}
      <h2>Tunebook</h2>
      <ul>
        {tunebook.map((tune) => (
          <li key={tune.id}>
            {tune.title} - {tune.rhythm} - {tune.key}
          </li>
        ))}
      </ul>

      {/* Friends */}
      <h2>Friends</h2>
      <ul>
        {friends.map((friend) => (
          <li key={friend.id}>
            <strong>{friend.name}</strong> - <a href={friend.tunebookLink}>View Tunebook</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
