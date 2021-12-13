const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


const COOKIE_NAME = "user_id"

app.set("view engine", "ejs");


const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "123"
  },

};

function generateRandomString() {
  let random = Math.random().toString(36).slice(6);
  console.log(random);
  return random;
}

const getUserByEmail = function (email) {
  const uservalues = Object.values(users);

  for (const user of uservalues) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
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


const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

app.get("/urls", (req, res) => {
  const id = req.cookies[COOKIE_NAME];
  const user = users[id];
  if (!user) {
    return res.status(401).send("You must <a href='/login'>login</a> first.");
  }
  const urls = urlsForUserId(id)
  console.log("urls", urls)
  const templateVars = { urls, user }
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// app.get("/urls", (req, res) => {
//   console.log(users[req.cookies["user_id"]]);
//   let templateVars = { urls: urlDatabase,user: users[req.cookies["user_id"]] };
//   res.render("urls_index", templateVars);
// });

// app.get("/u/:shortURL", (req, res) => {
//   shortURL = req.params.shortURL;
//   if (urlDatabase.hasOwnProperty(shortURL)) {
//     let longURL = urlDatabase[shortURL];
//     res.redirect(`${longURL}`);
//   };
// });

app.get("/user_test", function (req, resp) {
  res.render("user_test", { users });
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies['user_id'];
  const user = users[id];
  if (!user) {
    return res.redirect("/login")
  }

  res.render("urls_new", { user });
});

app.get("/urls/:id", function (req, res) {
  let templateVars = { 
    shortURL: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies[COOKIE_NAME] ]
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  res.render("register", { user: null });
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log('urlDatabase', urlDatabase, )
  let templateVars = { 
    shortURL, 
    longURL: urlDatabase[shortURL].longURL, 
    user: users[req.cookies[COOKIE_NAME] ]
  };
  res.render("urls_show", templateVars);
});

app.get("/login", (req, res) => {
  res.render("login", { user: null });
});

app.post("/urls", (req, res) => {

  console.log("Add New URL"); const userID = req.cookies[COOKIE_NAME]; const user = users[userID];

  if (!user) {

    return res.redirect("/login");

  }

  // console.log(req.body); // Log the POST request body to the console

  const shortURL = generateRandomString(6); const longURL = req.body.longURL; urlDatabase[shortURL] = { userID, longURL }; // Add to url database
  let templateVars = { 
    shortURL, 
    longURL: urlDatabase[shortURL].longURL, 
    user: users[req.cookies[COOKIE_NAME] ]
  };
  res.render("urls_show", templateVars);

  console.log(urlDatabase);

});


app.post("/register", function (req, res) {
  let email = req.body.email;
  let password = req.body.password;
  if (!email || email === "" && !password || password === "") {
    res.status(400).send("Please put in email and and password")
  } else {
    let match = false
    for (let i in users) {
      if (users[i].email === email && users[i].password === password) {
        match = true
      }
    }
    if (match) {
      res.status(400).send("email is already registered")
    }
    let id = generateRandomString()
    console.log(`${email} ${password}`)
    console.log(match)
    users[id] = {
      id: id,
      email: email,
      password: password
    };

    res.cookie(COOKIE_NAME, id);
    res.redirect("/urls");
  }
});



app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.cookies['user_id'];
  const user = users[userId];

  const url = urlDatabase[shortURL];
  console.log('url1', url, url && url.userId === userId, shortURL, urlDatabase)
  if (url && url.userID === userId)
    delete urlDatabase[shortURL];
  res.redirect("/urls");
});


app.post("/urls/:shortURL", (req, res) => {
  console.log("Save URL");
  const userId = req.cookies['user_id'];
  const user = users[userId];
  if (!user) {
    return res.redirect("/urls");
  }

  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { userId, longURL };

  res.redirect('/urls');
});




app.post("/login", function (request, response) {
  const name = request.body.username;
  const existUser = Object.values(users).find(user=> user.email === name );
  if(existUser){
    response.cookie(COOKIE_NAME, existUser.id);
    response.redirect("/urls");
  }else{
    response.sendStatus(400).render('Username does not exist')
  }
});



app.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
