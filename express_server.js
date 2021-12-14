const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');
const COOKIE_NAME = "user_id"

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { request } = require("express");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())


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
    password: "456"
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
  res.json(users);
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
//   const shortURL = req.params.shortURL;
//   if (urlDatabase[shortURL] === undefined) {
//     //if they put in a shortURL that doesn't exist in our database
//     res.send(
//       "It appears that URL does not exist. Consider checking My URLs again or making a tinyURL for that website!"
//     );
//   } else {
//     const longURL = urlDatabase[req.params.shortURL].longUrl;

//     res.redirect(longURL);
//   }
// });

app.get("/user_test", function (req, res) {
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

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newURL = req.body.newURL;
  const loggedIn = req.cookies.user_id;

  if (loggedIn === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL] = {longURL: newURL, userID: loggedIn};
    res.redirect("/urls");
  } else {
    res.send("You are nto authorized to edit this URL. Consider making your own 😃");
  }
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
  console.log(req.body)
  let email = req.body.email;
  let password = req.body.password;
  const user = getUserByEmail(email, users);
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || email === "" && !password || password == "") {
    res.status(400).send("Please put in email and and password")
  }  else
  {
    let match = false;
    for (let i in users)
    {
      if (users[i].email === email)
        match = true;
    }
    if (match)
      res.sendStatus(400).send("email is already registered")
    }
    let id = generateRandomString();
    console.log(`${email}     ${password}`);
    users[id] = {id: id,
                email: email,
                password: hashedPassword};
    console.log(users);
    res.cookie("user_id", id);
    res.redirect("/urls");
  });



app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.cookies["user_ID"];
  let shortURL = req.params.shortURL;
  if (userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];

    res.redirect("/urls");
  } else if (userID) {
    res.status(403).send("You are not the owner of this shortURL");
  } else {
    res.status(401).send("Please <a href= '/login'>login</a>");
  }
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




app.post("/login", function(request, response) {
  const email = request.body.username;
  const password = request.body.password;
  console.log(email, password)
  const user = getUserByEmail(email,users);
  // if (!email || email === "" && !password || password === "") {
  //   return response.status(403).send("Fields cannot be empty.");
  // }
  if (!user) {
    return response.status(403).send("There is no user with that email");
  }

  if (user.password !== password) {
  if (!bcrypt.compareSync(password, user.password)) {
    console.log(user[password]);
    return response.status(403).send('You have entered an incorrect password');

  }
  response.cookie('user_id', user.id);
  response.redirect("/urls");
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
