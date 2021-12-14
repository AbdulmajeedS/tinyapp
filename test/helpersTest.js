const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "123"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id,expectedUserID);
  });
  
  it('should return undefined when email is not in our database', function() {
    const user = getUserByEmail("user3@example.com", testUsers);
    assert.notDeepEqual(user,undefined);
  });

  it('should only work on emails', function() {
    const user = getUserByEmail("user2RandomID", testUsers);
    assert.notDeepEqual(user,undefined);
  });
});