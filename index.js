const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const User = require("./models/sirdb"); // Import User model for RSVP

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

// MongoDB connection string for EmptyRoom
const mongoURI = 'mongodb+srv://prayagadmin:me1234@pdeuer.p8bjgio.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(mongoURI);
const database = client.db('ListOfEmpty');
const collection = database.collection('empty-rooms');

// Mongoose connection string for RSVP
mongoose.connect('mongodb+srv://prayagatwork2:admin54321@cluster0.koogrwh.mongodb.net/info?retryWrites=true&w=majority');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define lab numbers for blocks E and F
const blockFLabs = ["002","003", "004", "102", "103", "104", "202", "203", "204"];
const blockELabs = ["007","008", "009", "010", "012", "107", "108", "109", "110", "111A", "112-113", "115", "206", "207", "208", "209", "211", "213", "214", "215", "216", "213/1", "213/C1", "111B", "212", "212/3", "301", "302", "303", "304", "305"];
const blockDLabs = ["105","106", "107", "006/A", "208/B"];
const blockCLabs = ["006","007", "008", "014A", "014B", "016", "017", "018", "105", "106", "107", "108", "205", "206", "012", "015B"];

// Routes for EmptyRoom
app.get('/', (req, res) => {
  res.render('index'); // Serve the index.ejs file
});

app.get('/rsvp/:roomNumber', (req, res) => {
  const { roomNumber } = req.params;
  console.log(roomNumber);  // Logs the room number
  res.render('rsvp', { roomNumber });
});

app.post('/', async (req, res) => {
  const mblock = req.body.block;
  const mday = req.body.day;
  const mtime = req.body.time;
  const mtype = req.body.type;

  console.log('Received request with parameters:');
  console.log('Block:', mblock);
  console.log('Day:', mday);
  console.log('Time:', mtime);
  console.log('Type:', mtype);

  try {
    // Find the block schedule based on the block
    const blockSchedule = await collection.findOne({ block: mblock });

    console.log('Retrieved block schedule from database:');
    console.log(blockSchedule);

    if (!blockSchedule) {
      console.log('Block not found');
      res.render('noroom');
      return res.status(404).send('Block not found');
    }

    let availableRooms = [];

    // Check for labs or halls and filter based on block E or F
    if (mtype === "lab") {
      const labs = mblock === "E" ? blockELabs : mblock === "F" ? blockFLabs : mblock === "D" ? blockDLabs : mblock === "C" ? blockCLabs : [];
      availableRooms = findLabsWithTimeSlot(blockSchedule, mday, mtime, labs);

      // Check if any labs are found
      if (availableRooms.length === 0) {
        console.log('No labs found with the specified time slot');
        res.render('noroom');
        return res.status(404).send('No labs found with the specified time slot');
      }
    } else if (mtype === "hall") {
      // Find all available rooms and filter out labs
      availableRooms = findRoomsWithTimeSlot(blockSchedule, mday, mtime);

      // Remove labs based on the selected block
      const blockLabs = mblock === "E" ? blockELabs : mblock === "F" ? blockFLabs : mblock === "D" ? blockDLabs : mblock === "C" ? blockCLabs : [];
      availableRooms = availableRooms.filter(room => !blockLabs.includes(room));
      
      // Check if any rooms are found
      if (availableRooms.length === 0) {
        console.log('No classrooms found with the specified time slot');
        res.render('noroom');
        return res.status(404).send('No classrooms found with the specified time slot');
      }
    } else {
      console.log('Invalid request type');
      res.status(400).json({ error: 'Invalid request type' });
      return;
    }

    console.log(`${mtype === "lab" ? 'Labs' : 'Rooms'} with the specified time slot:`, availableRooms);
    res.render('outcome', { ejslists: availableRooms });

  } catch (err) {
    console.error('Error finding block schedule:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function findLabsWithTimeSlot(blockSchedule, mday, mtime, labNumbers) {
  const labsWithTimeSlot = [];
  blockSchedule.rooms.forEach(room => {
    if (labNumbers.includes(room.room_number) && room.schedule[mday] && room.schedule[mday].includes(mtime)) {
      labsWithTimeSlot.push(room.room_number);
    }
  });
  return labsWithTimeSlot;
}

function findRoomsWithTimeSlot(blockSchedule, mday, mtime) {
  const roomsWithTimeSlot = [];
  blockSchedule.rooms.forEach(room => {
    if (room.schedule[mday] && room.schedule[mday].includes(mtime)) {
      roomsWithTimeSlot.push(room.room_number);
    }
  });
  return roomsWithTimeSlot;
}

// Routes for RSVP
app.get('/rsvp', (req, res) => {
  res.render("request"); // Serve the request.ejs file for RSVP
});

app.post('/rsvp', async (req, res) => {
  const user = new User({
    Name: req.body.Name,
    RoomNo: req.body.RoomNo,
    Date: req.body.Date,
    Details: req.body.Details,
    ReservationType: req.body.ReservationType,
    Email: req.body.Email
  });

  try {
    await user.save();
    console.log("User added successfully");
    res.redirect('/');
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).send("Error adding user");
  }
});

// Connect to MongoDB and start the server
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
