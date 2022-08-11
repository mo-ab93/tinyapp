const getUserByEmail = function (email, users) {
  for (let key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
};





module.exports = {getUserByEmail}