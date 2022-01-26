const cookieParser = require('cookie-parser');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    //console.log(result);
  
  }
  return result;
};

app.post("/urls/:shortURL/delete", (req, res) => {
  const templateVars = {
    username: req.cookies.username,
    urls: urlDatabase
    // ... any other vars
  };
  // const templateVars = { urls: urlDatabase };
  //console.log(urlDatabase[req.params.shortURL]);
  delete urlDatabase[req.params.shortURL];
  res.render("urls_index", templateVars);
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.post("/url/update", (req, res) => {
  // const templateVars = { urls: urlDatabase };
  console.log(req.body.longURL);
  console.log(req.body.shortURL);
  urlDatabase[req.body.shortURL] = req.body.longURL;
  const templateVars = {
    username: req.cookies.username,
    urls: urlDatabase
    // ... any other vars
  };
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies.username,
    urls: urlDatabase
    // ... any other vars
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let key = generateRandomString();
  //console.log(req.body.longURL + key);  // Log the POST request body to the console
  urlDatabase[key] = req.body;
  const templateVars = { username: req.cookies.username, shortURL: key, longURL:req.body.longURL};
  res.render("urls_show", templateVars);
  //res.send("/urls/:shortURL");
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/hello", (req, res) => {
  const templateVars = { username: req.cookies.username, greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies.username,
    urls: urlDatabase
    // ... any other vars
  };
  res.render("urls_new", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: req.cookies.username, shortURL: req.params.shortURL, longURL:urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
