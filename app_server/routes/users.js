
// Utility route for testing write access to users.json
var express = require('express');
var router = express.Router();
const fs = require('fs');
const path = require('path');
router.get('/test-users-json-write', function(req, res) {
  const filePath = path.join(__dirname, '../../data/users.json');
  let original = '';
  try {
    if (fs.existsSync(filePath)) {
      original = fs.readFileSync(filePath, 'utf8');
    }
    fs.writeFileSync(filePath, JSON.stringify([{test: 'write'}], null, 2));
    // Restore original
    fs.writeFileSync(filePath, original);
    res.send('users.json is writable');
  } catch (e) {
    res.send('users.json is NOT writable: ' + e.message);
  }
});
router.get('/signup', function(req, res) {
  res.render('signup', { title: 'Sign Up', email: req.session.email });
});
// Render signin page
router.get('/signin', function(req, res) {
  res.render('signin', { title: 'Sign In', email: req.session.email });
});
// Signup route
const bcrypt = require('bcrypt');
router.post('/signup', async function(req, res) {
  const { name, username, phone, email, password, confirm_password } = req.body;
  if (!name || !username || !phone || !email || !password || password !== confirm_password) {
    return res.render('signup', { title: 'Sign Up', error: 'All fields are required and passwords must match.', email: req.session.email });
  }
  const filePath = path.join(__dirname, '../../data/users.json');
  let users = [];
  if (fs.existsSync(filePath)) {
    try {
      users = JSON.parse(fs.readFileSync(filePath));
    } catch (e) {
      users = [];
    }
  }
  if (users.find(u => u.email === email)) {
  return res.render('signup', { title: 'Sign Up', error: 'Email already registered.', email: req.session.email });
  }
  const hashed = await bcrypt.hash(password, 10);
  users.push({ name, username, phone, email, password: hashed });
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
  res.redirect('/users/signin');
});
// Logout route
router.post('/logout', function(req, res) {
  req.session.destroy(function(err) {
    res.redirect('/');
  });
});
// Signin route
router.post('/signin', async function(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render('signin', { title: 'Sign In', error: 'Email and password required.' });
  }
  const filePath = path.join(__dirname, '../../data/users.json');
  let users = [];
  if (fs.existsSync(filePath)) {
    try {
      users = JSON.parse(fs.readFileSync(filePath));
    } catch (e) {
      users = [];
    }
  }
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render('signin', { title: 'Sign In', error: 'Invalid entry. Email or password is incorrect.', email: req.session.email });
  }
  req.session.email = user.email;
  req.session.name = user.name;
  req.session.username = user.username;
  req.session.phone = user.phone;
  res.redirect('/');
});

module.exports = router;