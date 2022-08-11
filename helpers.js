const getUserByEmail = function (email, users) {
  for (let key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
   return undefined;
};

const generateRandomString = function () {
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; i--) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};


const urlsForUser = function (id, urlDatabase) {
  let userUrls = {};

  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userUrls[key] = urlDatabase[key];
    }
  }

  return userUrls;
};




module.exports = {getUserByEmail, generateRandomString, urlsForUser}