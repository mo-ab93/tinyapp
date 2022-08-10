const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;


app.set('view engine', 'ejs');
app.use(cookieParser());

function generateRandomString() {
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let i = 6; i > 0; i--) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const genrateId = generateRandomString();

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));


app.get('/',(req, res) => {
  res.send('Hello World!');
});

app.get('/urls',(req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render('urls_index', templateVars);
});

//Add new Urls Method//
app.post('/urls', (req, res) => {
  console.log(req.body);
  urlDatabase[genrateId] = req.body.longURL;
  res.redirect(`/urls/${genrateId}`);
});

//Delete Urls Method//
app.post('/urls/:id/delete', (req, res) => {
  let deleteUrl = req.params.id;
  delete urlDatabase[deleteUrl]
  res.redirect("/urls");
});

//Update Urls Method//
app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

//login cookie//
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

//logout cookie//
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

// Registration 
app.get('/register',(req, res) => {
   res.render('registration');
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get('/urls/new',(req, res) => {
  const templateVars = { 
    username: req.cookies["username"]
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id',(req, res) => {
  const templateVars = {
    id: req.params.id, 
    longURL: urlDatabase[req.params.id], 
    username: req.cookies["username"]
  };
  res.render('urls_show', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});