const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const { lookUpByEmail } = require('./helpers');

const urlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'userRandomID' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'user2RandomID' },
  h65d93: { longURL: 'https://www.msn.ca', userID: 'user2RandomID' },
};

function generateRandomString(length) {
  let char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let answer = '';
  for (let i = 0; i < length; i++) {
    answer += char.charAt((Math.random()*char.length));
  }
  return answer;
}

const checkEmail = function(database, email) {
  for (const id in database) {
    if (database[id].email === email) {
      return true;
    }
  }
  return false;
}

const checkPassword = function(database, password) {
  for (const id in database) {
    if (database[id].password === password) {
      return true;
    }
  }
  return false;
}

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "aaa"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "vvv"
  }
}

const urlsForUser = function (id) {
  let specificURLs = {};

  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl]['userID'] === id) {
      specificURLs[shortUrl] = urlDatabase[shortUrl];
    }
  }
  console.log("Specific URLs:", specificURLs);
  return specificURLs;
  
}

app.get("/urls", (req, res) => {

  const userID = req.session.user_ID;
  console.log(userID);
  const user = users[userID]
  const templateVars = { username: userID, urls: urlsForUser(userID, urlDatabase), user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_ID;
  const user = users[userID];
  const templateVars = { username: req.session.user_ID, user};
  if (req.session.user_ID) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_ID;
  const user = users[userID]
  let userUrls = urlsForUser(req.session.user_ID);
  let shortUrl = req.params.shortURL;
  console.log("UserUrls: ", userUrls);
  
  if (!userUrls[shortUrl]) {
    res.send(`Login with correct user!`);
  };

  if (req.session.user_ID == userUrls[shortUrl].userID) {
    const long = userUrls[shortUrl].longURL;
    const templateVars = { shortURL: shortUrl , longURL: long, username: req.session.user_ID, user};
    res.render("urls_show", templateVars);
  } else {
    throw new Error(`Not authorized to edit this URL!`)
  }
  
});

app.post("/urls", (req, res) => {
  let code = generateRandomString(6)
  urlDatabase[code] = {longURL: req.body.longURL, userID: req.session.user_ID};

  // console.log("XX: ", urlDatabase);
  res.redirect(`/urls/${code}`);
});

// LOGIN - in header (no longer needed)
app.get("/urls/login", (req, res) => {
  const templateVars = { urls: urlDatabase, username: users[usernameID] };
  res.render("urls_index", templateVars);
});

app.post("/urls/login", (req, res) => {
  const user = req.body.username;
  const templateVars = { urls: urlDatabase, username: users[usernameID] };
  res.cookie('username', user);
  res.redirect('/urls', templateVars);
})

//LOGIN PAGE
app.get("/login", (req, res) => {
  const userID = req.session.user_ID;
  const user = users[userID];
  const templateVars = { urls: urlDatabase, username: req.session.user_ID, user};
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  if (checkEmail(users, req.body.email) && (checkPassword(users, req.body.password))) {
    req.session.user_ID = lookUpByEmail(email, users)

  } else {
    res.status(404).send('Error 404: Wrong Username/Password')
  }
  res.redirect('/urls');
})

//LOGOUT
app.post("/urls/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
})

//REGISTER
app.get('/register', (req, res) => {
  const userID = req.session.user_ID;
  const user = users[userID];
  let usernameID = generateRandomString(6);
  users[usernameID] = {
    id: usernameID,
    email: req.body.email,
    password: req.body.password
  }

  const templateVars = { urls: urlDatabase, username: req.session.user_ID, user};
  res.render('urls_register', templateVars);
})

app.post("/register", (req, res) => {
  let usernameID = generateRandomString(6);
  if (checkEmail(users, req.body.email)) {
    res.status(400).send('Error 400 Bad Request: Account already exists')
  }
  // Error 400 if there's no password
  if ((!req.body.password) || (!req.body.email) ) {
    res.status(400);
    res.send('Error 400 Bad Request')
  }
  
  users[usernameID] = {
    id: usernameID,
    email: req.body.email,
    password: req.body.password
  }
  
  console.log(users);
  // res.cookie('user_ID', usernameID)
  req.session.user_ID = usernameID;

  const templateVars = { urls: urlDatabase, username: req.session.user_ID};
  // res.render('urls_index', templateVars);
  res.redirect('/urls');
})

//OPEN SHORT URL
app.get("/u/:shortURL", (req, res) => {
  longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(longURL);
  res.redirect(longURL);
});

//DELETE URL
app.post('/urls/:shortURL/delete', (req,res) => {
  const userID = req.session.user_ID;
  let userUrls = urlsForUser(req.session.user_ID);
  console.log(`UserUrls: ${userUrls}`);
  console.log(userUrls);
  let shortUrl = req.params.shortURL;
  console.log(`shortUrl: ${shortUrl}`);


  if (!userUrls[shortUrl]) {
    throw new Error(`${shortUrl} does not exist for this user!`)
  };

  if (req.session.user_ID == userUrls[shortUrl].userID) {
    delete userUrls[shortUrl].userID; 
  } 

  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req,res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL; 
  res.redirect(`/urls/${req.params.shortURL}`);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
