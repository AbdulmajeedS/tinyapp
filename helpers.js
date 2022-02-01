const lookUpByEmail = function (userEmail, database) {
  for (const id in database) {
    if (database[id].email === userEmail) {
      return database[id].id;
    }
  }
}

module.exports = { lookUpByEmail };