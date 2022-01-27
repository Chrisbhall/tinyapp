const cookieParser = require('cookie-parser');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


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


const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "123Abc": {
    id:"123Abc",
    email: "wow1334@hotmail.ca",
    password:"pass"
  }
}

const urlsForUser = function (id) {
  const urlFilDB = {};
  for (short in urlDatabase) {
    if (id.id == urlDatabase[short]["userID"]) {
      urlFilDB[short] = {longURL:urlDatabase[short]["longURL"],
      userID:urlDatabase[short]["userID"]};
    }
  }
  //console.log(urlFilDB);
  return urlFilDB;
}

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
    //console.log(result);
  }
  return result;
};

//check for existing user & return true if found
const existingUser = function (emailID) {
  console.log(users);
  for (const user in users) {
    //console.log(users[user]["email"]);
    if (emailID === users[user]["email"]) {
      return users[user]["id"];
    }
  }
  return false;
}

app.post("/urls/:shortURL/delete", (req, res) => {
  const yourURLS = urlsForUser(req.cookies.user_id);
  if (!yourURLS || req.params.shortURL !== yourURLS[url]) {
    res.status('403').send('403 - You do not have permissions to delete this URL')
  }
  const templateVars = {
    username: req.cookies.user_id,
    urls: urlDatabase
  };
  // const templateVars = { urls: urlDatabase };
  //console.log(urlDatabase[req.params.shortURL]);
  delete urlDatabase[req.params.shortURL];
  res.render("urls_index", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const pass = req.body.password;
  if (email === "" || pass === "") {
    res.status('400').send('400 - Both the email & password fields must be filled.')
  }
  if (existingUser(email)) {
    res.status('400').send('400 - User already exists')
  }
  const username = generateRandomString();
  users[username] = {id: username, email: req.body.email, password: req.body.password};
  res.cookie("user_id", users[username]);
  //console.log(users);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const userID = existingUser(req.body.email);
  if (userID && req.body.password === users[userID]["password"]) {
  const username = req.body.email;
  res.cookie("user_id", users[userID]);
  res.redirect("/urls");
  } else {
    res.status('403').send('403')
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/url/update", (req, res) => {
  
  console.log(req.body.longURL);
  console.log(req.body.shortURL);
  urlDatabase[req.body.shortURL] = req.body.longURL;
  const templateVars = {
    username: req.cookies.user_id,
    urls: urlDatabase
    // ... any other vars
  };
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    username: req.cookies.user_id,
    urls: urlDatabase
  };
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies.user_id,
    urls: urlsForUser(req.cookies.user_id)
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    res.status('403').send('Please login to create a URL.')
  }
  let key = generateRandomString();
  
  urlDatabase[key] = req.body;
  const templateVars = { username: req.cookies.user_id, shortURL: key, longURL:req.body.longURL};
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { username: req.cookies.user_id, greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies.user_id,
    urls: urlDatabase
  };
  if (!templateVars.username) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies.user_id
  }
  res.render("new_user", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: req.cookies.user_id, shortURL: req.params.shortURL, longURL:urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
