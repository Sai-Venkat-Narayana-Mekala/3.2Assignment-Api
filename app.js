// app.js

const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json()); // Middleware to parse JSON requests

// Connect to MongoDB Atlas
const dbUri = 'mongodb+srv://saivenkatnarayanamekala:saivenkatnarayana%402024@cluster0.fjadlsp.mongodb.net/sportsDB?retryWrites=true&w=majority';

mongoose.connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(error => console.error('Error connecting to MongoDB Atlas:', error));

// Define Player Schema
const playerSchema = new mongoose.Schema({
    _id: String,
    name: String,
    position: String,
    rushingYards: Number,
    touchdownPasses: Number,
    sacks: Number,
    fieldGoalsMade: Number,
    fieldGoalsMissed: Number,
    catchesMade: Number
}, { collection: 'packers' }); // Specify the collection name

// Create Player Model
const Player = mongoose.model('Player', playerSchema);

// Get all players
app.get('/players', async (req, res) => {
    try {
        const players = await Player.find();
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch players' });
    }
});

// Add a new player
app.post('/players', async (req, res) => {
    const newPlayer = new Player(req.body);
    try {
        await newPlayer.save();
        res.status(201).json(newPlayer);
    } catch (error) {
        res.status(400).json({ error: 'Failed to add player' });
    }
});

// Update a player
app.put('/players/:id', async (req, res) => {
    try {
        const updatedPlayer = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPlayer) return res.status(404).json({ error: 'Player not found' });
        res.json(updatedPlayer);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update player' });
    }
});

// Delete a player
app.delete('/players/:id', async (req, res) => {
    try {
        const deletedPlayer = await Player.findByIdAndDelete(req.params.id);
        if (!deletedPlayer) return res.status(404).json({ error: 'Player not found' });
        res.json({ message: 'Player deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete player' });
    }
});

// Perform queries
app.get('/query', async (req, res) => {
    const { type } = req.query;
    let result;
    try {
        switch (type) {
            case 'most_touchdown_passes':
                result = await Player.findOne().sort('-touchdownPasses');
                break;
            case 'most_rushing_yards':
                result = await Player.findOne().sort('-rushingYards');
                break;
            case 'least_rushing_yards':
                result = await Player.findOne().sort('rushingYards');
                break;
            case 'most_field_goals':
                result = await Player.findOne().sort('-fieldGoalsMade');
                break;
            case 'most_sacks':
                result = await Player.findOne().sort('-sacks');
                break;
            default:
                return res.status(400).json({ error: 'Invalid query type' });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to perform query' });
    }
});

// Export the app for testing
module.exports = app;

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
