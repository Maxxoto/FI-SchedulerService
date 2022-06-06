const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const rfs = require('rotating-file-stream');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const Agenda = require('agenda');

require('dotenv').config();

// ENV and KEYS
const PORT = process.env.PORT || 9000;

// Mongoose models
require('./models/Message');
require('./models/Scheduler');

// Import Routes
const schedulerRoute = require('./routes/schedulerRoutes');

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Global Middleware
app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    })
);

app.use(morgan('combined', { stream: accessLogStream }));

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(bodyParser.json());

// Rotating logstream
var accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: path.join(__dirname, 'logs'),
});
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('common'));
}

// Declaring service
const agenda = new Agenda({ db: { address: process.env.MONGO_URI } });
const agendaService = require('./services/agendaService');
agendaService.createSMSScheduler(agenda);

// Declaring Routes
schedulerRoute(app, agenda);

app.listen(PORT, () => {
    console.log(`Server live and running on port ${PORT}`);
});
