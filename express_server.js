const express = require('express');
const cookieParser = require('cookie-parser');
const { render } = require('ejs');
const bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10);
const app = express();
const PORT = 8080;


app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////                                  Functions part                                  /////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const generateRandomString = function () {
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; i--) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};


const findUserWithEmail = function (email, users) {
  for (let key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
};

const urlsForUser = function (id) {
  let userUrls = {};

  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userUrls[key] = urlDatabase[key];
    }
  }

  return userUrls;
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////                                  Databases part                                   /////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
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
    password: "purple-monkey-dinosaur",
  },
  aJ43fW: {
    id: "aJ43fW",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
// const password = "purple-monkey-dinosaur"; // found in the req.body object
// const hashedPassword = bcrypt.hashSync(password, 10);
// console.log(users, hashedPassword);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////                                  Routres part                                   /////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/urls', (req, res) => {
  // const templateVars = { urls: urlDatabase, email: users[req.cookies["user_id"]]?.email };
  const userId = req.cookies['user_id'];
  const userUrls = urlsForUser(userId);
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
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = {
    user
  };
  return res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const user = users[req.cookies["user_id"]];
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
app.get('/urls.json2', (req, res) => {
  res.json(users);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////                            Urls Method part                                       /////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Add new Urls Method//
app.post('/urls', (req, res) => {
  console.log(req.body);
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.status(401).send('the user must login');
  }
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortUrl}`);
});

//Delete Urls Method//
app.post('/urls/:id/delete', (req, res) => {
  const user = users[req.cookies["user_id"]];
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
  const user = users[req.cookies["user_id"]];
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

  const user = users[req.cookies["user_id"]];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: null
  }
  return res.render('user_login', templateVars);
});

//login Post cookie//
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // const userObject = findUserWithEmailPssword(email, password, users);
  const userObject = findUserWithEmail(email, users);
  if (!userObject) {
    return res.status(401).send('Invaild credentials');
  }
  const password1 = userObject.password; // found in the req.body object
  const hashedPassword = bcrypt.hashSync(password1, salt);
  const passwordMatch = bcrypt.compareSync(password, hashedPassword);
  if (!passwordMatch) {
    return res.status(401).send('Invaild credentials');
  }
  console.log(userObject.id);
  res.cookie('user_id', userObject.id);

  return res.redirect('/urls');
});

//logout Post cookie//
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////                            Registration part                                      /////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Registration GET
app.get('/register', (req, res) => {

  const user = users[req.cookies["user_id"]];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: null
  }
  return res.render('registration', templateVars);

});

// Registration POST
app.post('/register', (req, res) => {
  // console.log(req.cookies);
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    return res.status(400).send('Bad Request');
  }
  if (findUserWithEmail(email, users)) {
    return res.status(400).send('Bad Request');
  }
  const genrateId = generateRandomString();
  users[genrateId] = { id: genrateId, email: email, password: bcrypt.hashSync(password, salt)};
  const user = users[genrateId];
  console.log(user);
  res.cookie('user_id', user.id);

  return res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});