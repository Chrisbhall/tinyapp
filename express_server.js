const cookieSession = require('cookie-session');
const express = require("express");
const existingUser = require("./helper.js");
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

const bodyParser = require("body-parser");
const { redirect } = require('express/lib/response');
app.use(bodyParser.urlencoded({extended: true}));

// DB for URLS (any new URLs generated get stored here)
const urlDatabase = {
  b2xVn2:{
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "123Abc"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "123Abc"
  }
};

//users DB (if a new user registers it gets stored here)
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur")
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk")
  },
  "123Abc": {
    id:"123Abc",
    email: "wow1334@hotmail.ca",
    password:bcrypt.hashSync("pass", 10)
  }
};
// returns list of URLS owned by user
const urlsForUser = function(id) {
  const urlFilDB = {};
  if (!id) {
    return null;
  }
  for (let short in urlDatabase) {
    if (id.id === urlDatabase[short]["userID"]) {
      urlFilDB[short] = {longURL:urlDatabase[short]["longURL"],
        userID:urlDatabase[short]["userID"]};
    }
  }
  return urlFilDB;
};

// generate a random short string of 6 characters
const generateRandomString = function() {
  let random = 0;
  let letter = 0;
  let result = String.fromCharCode(Math.round(Math.random() * (57 - 48)) + 48);
  for (let i = 0; i < 6; i++) {
    random = Math.round(Math.random() * (6 - 1)) + 1;
    if (random % 2 === 0) {
      letter = String.fromCharCode(Math.round(Math.random() * (90 - 65)) + 65);
    } else if (random % 3 === 0) {
      letter = String.fromCharCode(Math.round(Math.random() * (122 - 97)) + 97);
    } else {
      letter = String.fromCharCode(Math.round(Math.random() * (57 - 48)) + 48);
    }
    result += letter;
  }
  return result;
};

// delete URL if it is owned by you
app.post("/urls/:shortURL/delete", (req, res) => {
  const yourURLS = urlsForUser(req.session.user_id);
  if (!yourURLS || !yourURLS[req.params.shortURL]) {
    res.status('403').send('403 - You do not have permissions to delete this URL');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// register the user account if something is wrong return error
app.post("/register", (req, res) => {
  const email = req.body.email;
  const pass = req.body.password;
  if (email === "" || pass === "") {
    res.status('400').send('400 - Both the email & password fields must be filled.');
  }
  if (existingUser(email, users)) {
    res.status('400').send('400 - User already exists');
  }
  const hashedPassword = bcrypt.hashSync(pass, 10);
  const username = generateRandomString();
  users[username] = {id: username, email: req.body.email, password: hashedPassword};
  req.session.user_id = users[username];
  res.redirect("/urls");
});

//log user in if credentials are correct else throw error
app.post("/login", (req, res) => {
  const userID = existingUser(req.body.email, users);
  if (userID && bcrypt.compareSync(req.body.password, users[userID]["password"], 10)) {
    req.session.user_id = users[userID];
    res.redirect("/urls");
  } else {
    res.status('403').send('403');
  }
});

// redirect to login & destroy cookie session
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// update url
app.post("/url/update", (req, res) => {
  const yourURLS = urlsForUser(req.session.user_id);
  if (!yourURLS || !yourURLS[req.params.shortURL]) {
    res.status('403').send('403 - You do not have permissions to update this URL');
  }
  urlDatabase[req.body.shortURL] = {longURL:req.body.longURL, userID:req.session.user_id["id"]};
  res.redirect("/urls");
});

//load login page
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  const templateVars = {
    username: req.session.user_id,
    urls: urlDatabase
  };
  res.render("login", templateVars);
});

//load main page if logged in if not redirect to login page
app.get("/", (req, res) =>{
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  redirect("/urls");
});

//load main page if not logged in throw error
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status('403').send('403');
  }
  const templateVars = {
    username: req.session.user_id,
    urls: urlsForUser(req.session.user_id)
  };
  res.render("urls_index", templateVars);
});

//create a new URL in the DB if not logged in throw error
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status('403').send('Please login to create a URL.');
  }
  let key = generateRandomString();
  
  urlDatabase[key] = {longURL:req.body.longURL, userID:req.session.user_id["id"]};
  const templateVars = { username: req.session.user_id, shortURL: key, longURL:req.body.longURL};
  res.render("urls_show", templateVars);
});

//hello world page from initial exercise
app.get("/hello", (req, res) => {
  const templateVars = { username: req.session.user_id, greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

//get new url page if not logged in redirect to login page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.session.user_id,
    urls: urlDatabase
  };
  if (!templateVars.username) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

//go to long urls website when entering short url into address bar
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

//get registration page if already signed in redirect to main page
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  const templateVars = {
    username: req.session.user_id
  };
  res.render("new_user", templateVars);
});

//get url edit page
app.get("/urls/:shortURL", (req, res) => {
  const yourURLS = urlsForUser(req.session.user_id);
  if (!req.session.user_id || !yourURLS[req.params.shortURL]) {
    res.status('403').send('403');
  }
  const templateVars = { username: req.session.user_id, shortURL: req.params.shortURL, longURL:urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

//render 404 if page is not found
app.get('*', function(req, res) {
  res.status(404).send('404 - Page Not Found!?');
});

//list on port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
