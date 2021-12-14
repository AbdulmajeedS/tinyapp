// //////////helper function storage////////////

const getUserByEmail = function (email) {
  const uservalues = Object.values(users);

  for (const user of uservalues) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

function generateRandomString() {
  let random = Math.random().toString(36).slice(6);
  console.log(random);
  return random;
};

const urlsForUserId = function (id) {

  const result = {};

  for (const shortURL in urlDatabase) {
    const urlObj = urlDatabase[shortURL];
    if (urlObj.userID === id) {
      result[shortURL] = urlObj
    }
  }
  return result;

};

module.exports = {getUserByEmail, generateRandomString, urlsForUserId};
