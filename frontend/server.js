const express = require('express');
const path = require('path');
const app = express();
const port = 5500;

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/index.html', (req, res) => {
    res.render('index');
});

app.get('/customers.html', (req, res) => {
    res.render('customers');
});

app.get('/trainers.html', (req, res) => {
    res.render('trainers');
});

app.get('/equipments.html', (req, res) => {
    res.render('equipments');
});

app.get('/sessions.html', (req, res) => {
    res.render('sessions');
});

app.listen(port, () => {
    console.log(`Frontend server running on http://localhost:${port}`);
});
