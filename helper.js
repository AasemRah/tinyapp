function generateRandomString() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  
  for (let i = 0; i < 6; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return randomString;
}

const urlsForUser = function (urlDatabase, userID) {
  const filteredURLS = {};
  console.log(userID);
  for (let shortURL in urlDatabase) {
    if (userID === urlDatabase[shortURL].userID) {
      filteredURLS[shortURL] = urlDatabase[shortURL];
    }
    console.log("test---", filteredURLS);
  }
  return filteredURLS;
};

const getUserByEmail = function (email, users) {
  for (const userID in users) {
    if (users[userID].email === email) {
      return userID;
    }
  }
  return;
};

module.exports = { 
  getUserByEmail,
  urlsForUser,
  generateRandomString,
};