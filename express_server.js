const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// generate a random short string of 6 characters
function generateRandomString() {
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
}

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let key = generateRandomString();
  //console.log(req.body.longURL + key);  // Log the POST request body to the console
  urlDatabase[key] = req.body; 
  const templateVars = { shortURL: key, longURL:req.body.longURL};
  res.render("urls_show", templateVars);
  //res.send("/urls/:shortURL");
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
   const longURL = urlDatabase[req.params.shortURL]["longURL"];
   res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL:urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});






/*
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
*/
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
