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
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

// Admin Routes
app.get('/admin/dashboard', (req, res) => {
    res.render('index');
});

app.get('/admin/customers', (req, res) => {
    res.render('customers');
});

app.get('/admin/trainers', (req, res) => {
    res.render('trainers');
});

app.get('/admin/equipments', (req, res) => {
    res.render('equipments');
});

app.get('/admin/sessions', (req, res) => {
    res.render('sessions');
});

app.get('/admin/logs', (req, res) => {
    res.render('logs');
});

// User Routes
app.get('/user/dashboard', (req, res) => {
    res.render('user/dashboard');
});

app.get('/user/profile', (req, res) => {
    res.render('user/profile');
});

// Fallback for old links (redirect to new structure)
app.get('/index.html', (req, res) => res.redirect('/admin/dashboard'));
app.get('/customers.html', (req, res) => res.redirect('/admin/customers'));
app.get('/trainers.html', (req, res) => res.redirect('/admin/trainers'));
app.get('/equipments.html', (req, res) => res.redirect('/admin/equipments'));
app.get('/sessions.html', (req, res) => res.redirect('/admin/sessions'));


app.listen(port, () => {
    console.log(`Frontend server running on http://localhost:${port}`);
});
