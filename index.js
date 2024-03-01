const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.static("public"));
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection string and database name
const uri = 'mongodb+srv://prayagadmin:me1234@pdeuer.p8bjgio.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri);
const database = client.db('ListOfEmpty');
const collection = database.collection('empty-rooms');

// Connect to MongoDB
client.connect()
    .then(() => {
        console.log('Connected to MongoDB');
        // Start the server after successful MongoDB connection
        app.listen(port, () => {
            console.log(`Server is up and running on port ${port}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
    });

app.get("/", (req,res)=>{
    res.render('index');
});

// POST route to handle requests
app.post('/', async (req, res) => {
    const mblock = req.body.block;
    const mday = req.body.day;
    const mtime = req.body.time;

    console.log('Received request with parameters:');
    console.log('Block:', mblock);
    console.log('Day:', mday);
    console.log('Time:', mtime);

    try {
        // Find the block schedule based on the block
        const blockSchedule = await collection.findOne({ block: mblock });

        console.log('Retrieved block schedule from database:');
        console.log(blockSchedule);

        if (!blockSchedule) {
            console.log('Block not found');
            return res.status(404).json({ message: 'Block not found' });
        }

        // Find rooms with the specified time slot
        const roomsWithTimeSlot = [];
        blockSchedule.rooms.forEach(room => {
            if (room.schedule[mday] && room.schedule[mday].includes(mtime)) {
                roomsWithTimeSlot.push(room.room_number);
            }
        });

        if (roomsWithTimeSlot.length > 0) {
            console.log('Rooms with the specified time slot:', roomsWithTimeSlot);
            // res.json({ roomsWithTimeSlot });
            res.render('outcome', {ejslists : roomsWithTimeSlot});
        } else {
            console.log('No rooms found with the specified time slot');
            res.render('noroom');
        }
    } catch (err) {
        console.error('Error finding block schedule:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

