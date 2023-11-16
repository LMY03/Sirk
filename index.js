const express = require('express');
const mongoose = require('mongoose');
const passport = require('./controller/passport.js'); // Import the passport module
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const routes = require('./route.js');

const app = new express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//View .ejs files 
app.set('view engine', 'ejs');
app.set('views', 'view');

app.use('/public', express.static((__dirname) + '/public'));

const mongoURI = process.env.MONGODB_URI || "mongodb+srv://eb:19TfyZqixRpkrVAA@app.wpiujqj.mongodb.net/APP";
mongoose.connect(mongoURI)
// .then(() => console.log('Connected to MongoDB'))
// .catch(err => console.error('Connection error:', err));

app.use(
    session({
        store: MongoStore.create({ mongoUrl: mongoURI }),
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: true,
    })
);
  
app.use(passport.initialize());
app.use(passport.session());
  
const port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("server is running at port: " + port);
});
  
app.use('/', routes);