const express = require('express');
const cookieSession = require('cookie-session');
const { render } = require('ejs');
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const app = express();
const PORT = 8080;
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['5cec9ea5-6fa1-41b6-808e-3bbe54377f9e'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////                                  Databases part                                   /////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  i3Bowr: {
    longURL: "https://www.google.ca",
    userID: "aJ43fW",
  }
};


const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", salt),
  },
  aJ43fW: {
    id: "aJ43fW",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", salt),
  },
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////                                  Routres part                                   /////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/urls', (req, res) => {

  const userId = req.session.user_id;
  const userUrls = urlsForUser(userId, urlDatabase);
  let templateVars = { urls: userUrls, user: users[userId] };
  return res.render('urls_index', templateVars);

});

app.get("/u/:id", (req, res) => {

  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    return res.status(401).send('Can not find this short URL in database');
  }
  res.redirect(longURL);
});

app.get('/urls/new', (req, res) => {

  const user = users[req.session.user_id];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = {
    user
  };
  return res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.redirect("/login");
  }

  const urlObject = urlDatabase[req.params.id];
  if (!urlObject) {
    return res.status(404).send('URL not found');
  }

  const urlBelongsToUser = urlObject.userID === user.id;
  if (!urlBelongsToUser) {
    return res.status(401).send('You are not the owner!!');
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlObject.longURL,
    user: user
  };
  res.render('urls_show', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////                            Urls Method part                                       /////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Add new Urls Method//
app.post('/urls', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send('the user must login');
  }
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortUrl}`);
});

//Delete Urls Method//
app.post('/urls/:id/delete', (req, res) => {

  const user = users[req.session.user_id];
  if (!user) {
    return res.redirect("/login");
  }

  const urlObject = urlDatabase[req.params.id];
  if (!urlObject) {
    return res.status(404).send('URL not found');
  }

  const urlBelongsToUser = urlObject.userID === user.id;
  if (!urlBelongsToUser) {
    return res.status(401).send('You are not the owner!!');
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//Update Urls Method//
app.post('/urls/:id', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.redirect("/login");
  }

  const urlObject = urlDatabase[req.params.id];
  if (!urlObject) {
    return res.status(404).send('URL not found');
  }

  const urlBelongsToUser = urlObject.userID === user.id;
  if (!urlBelongsToUser) {
    return res.status(401).send('You are not the owner!!');
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////                            Login and log out part                                 /////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Login Get
app.get('/login', (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: null
  };
  return res.render('user_login', templateVars);
});

//login Post
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const userObject = getUserByEmail(email, users);
  if (!userObject) {
    return res.status(401).send('Invaild credentials');
  }

  const passwordMatch = bcrypt.compareSync(password, userObject.password);
  if (!passwordMatch) {
    return res.status(401).send('Invaild credentials');
  }

  req.session.user_id = userObject.id;

  return res.redirect('/urls');
});

//logout Post
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////                            Registration part                                      /////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Registration GET
app.get('/register', (req, res) => {

  const user = users[req.session.user_id];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: null
  };
  return res.render('registration', templateVars);

});

// Registration POST
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (email === '' || password === '') {
    return res.status(400).send('Bad Request');
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send('Bad Request');
  }
  const genrateId = generateRandomString();
  users[genrateId] = { id: genrateId, email: email, password: bcrypt.hashSync(password, salt) };
  const user = users[genrateId];

  req.session.user_id = user.id;

  return res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});