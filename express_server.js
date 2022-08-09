const express = require('express');
const app = express();
const PORT = 8080;


app.set('view engine', 'ejs');

function generateRandomString(lengthStr, chars) {
  let result = '';
  for (let i = lengthStr; i > 0; i--) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));


app.get('/',(req, res) => {
  res.send('Hello World!');
});

app.get('/urls',(req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('ok');
});

app.get('/urls/new',(req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id',(req, res) => {
const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id]};
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