const express = require('express');
const cookieParser = require('cookie-parser');
const { render } = require('ejs');
const app = express();
const PORT = 8080;


app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


const generateRandomString = function() {
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; i--) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const findUserWithEmail = function(email, users) {
  for (let key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
 };

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


app.get('/',(req, res) => {
  res.send('Hello World!');
});

app.get('/urls',(req, res) => {
  const templateVars = {urls: urlDatabase, email: req.cookies["email"]};
  res.render('urls_index', templateVars);
});

//Add new Urls Method//
app.post('/urls', (req, res) => {
  console.log(req.body);
  const genrateId = generateRandomString();
  urlDatabase[genrateId] = req.body.longURL;
  res.redirect(`/urls/${genrateId}`);
});

//Delete Urls Method//
app.post('/urls/:id/delete', (req, res) => {
  let deleteUrl = req.params.id;
  delete urlDatabase[deleteUrl];
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

// Registration GET
app.get('/register', (req, res) => {
   res.render('registration');
});

// Registration POST
app.post('/register', (req, res) => {
console.log(req.cookies);

const email = req.body.email;
const password = req.body.password;

if (email === '' || password === '') {
  return res.status(400).send('Bad Request');
}
if (findUserWithEmail(email, users)) {
  return res.status(400).send('Bad Request');
}

const genrateId = generateRandomString();
users[genrateId] = {id: genrateId, email: email, password: password};
const user = users[genrateId];
res.cookie('user_id', user.id);
res.cookie('email', user.email);

  return res.redirect('/urls');
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get('/urls/new',(req, res) => {
  const templateVars = {
    email: req.cookies["email"]
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id',(req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    email: req.cookies["email"]
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