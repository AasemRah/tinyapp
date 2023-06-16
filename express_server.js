const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require ("body-parser");
const cookieParser = require("cookie-parser");

function generateRandomString() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  
  for (let i = 0; i < 6; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return randomString;
}

const urlsForUser = function (userID) {
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



app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//GET ROUTE HANDLERS
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/users.json", (req, res) => {
  res.json(users);
});

app.get("/urls", (req, res) => {
  if (!req.cookies["userID"]) {
    return res.redirect("/login");
  }
  const templateVars = { urls: urlDatabase,
    urls: urlsForUser (req.cookies["userID"]),
    userID: req.cookies['userID'],
    user : users[req.cookies["userID"]],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    userID: req.cookies["userID"],
    user: users[req.cookies["userID"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (req.cookies["userID"] !== urlDatabase[shortURL].userID) {
    return res.send("You are not authorized to edit this"); 
  }
  const templateVars = { longURL: longURL, shortURL: shortURL, userID: req.cookies["userID"], users: users[req.cookies["userID"]], user: users[req.cookies["userID"]]};
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => { 
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  const templateVars ={
    userID: req.cookies["userID"],
    user: users[req.cookies["userID"]],
  };
  res.render("user_registeration", templateVars)
});

app.get("/login", (req, res) => {
  const templateVars = {
    userID: null,
    user: users[req.cookies['userID']],
  }
    res.render("user_login", templateVars);
  });

app.post("/urls", (req, res) => {
  if (!req.cookies["userID"]) {
    return res.redirect("/login");
  }
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  console.log("here");
  urlDatabase[shortURL] = { longURL: longURL, userID: req.cookies["userID"] };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`); 
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  if (req.cookies["userID"] === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls/");
  } else {
    res.send("You are not authorized to delete this");
  }
  res.redirect("/urls/");
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.cookies["userID"] !== urlDatabase[shortURL].userID) {
    return res.send("You are not authorized to edit this"); 
  }
  urlDatabase[shortURL].longURL = req.body.newURL;
  res.redirect("/urls/");
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  console.log("reguest body", req.body);
  let password = req.body.password;
  for (const user in users) {
    if (users[user].email === email) {
    if (users[user].password === password) {
      res.cookie("userID", users[user].id);
      return res.redirect("/urls");
    }
    return res.status(403).send("You have entered the wrong password.");
  }
}

  return res.status(403).send("Status: 403 An account does not exist.");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID", users[req.cookies.userID]);
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  if (!req.body.email || !req.body.password) {
    return res
      .status(400)
      .send("The email or password was left empty. Please try again.");
  }
  for (const user in users) {
    if (users[user].email === email) {
      return res.status(400).send("An account already exists.");
    }
  }

  let ID = generateRandomString();
  users[ID] = {
    id: ID,
    email: req.body.email,
    password: req.body.password,
  };
  res.cookie("user_id", ID);
  console.log("users----", users);
  res.redirect("/urls");
});

//PORT LISTENER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
