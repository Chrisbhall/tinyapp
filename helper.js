//check for existing user & return true if found
const existingUser = function (emailID, usersDB) {
  for (const user in usersDB) {
    if (emailID === usersDB[user]["email"]) {
      return usersDB[user]["id"];
    }
  }
  return false;
}

module.exports = existingUser;