const PORT = 8080; // default port 8080

//Dependencies
const express = require("express");
const app = express();
const bodyParser = require ("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByEmail, urlsForUser, generateRandomString } = require("./helper")

//Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));

//Data for Website
const urlDatabase = {
  b6UTxQ: {longURL: "https://www.tsn.ca", userID: "userRandomID"},
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID"},
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$pWTEC9A4T0gEhlPl1yxQTOKnP642wdO8d7bdMAq4ql2lboa5H7lUG",// "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$n//OI1rqSEff3K0Zm43C4uwcL/TjZGZNZki/8RQgP0pcxByDTTT9.", // "dishwasher-funk"
  },
};

//GET ROUTE HANDLERS
app.get("/", (req, res) => {
  res.send("/urls");
});

//Viewing current urlDatabase 
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Viewing current users
app.get("/users.json", (req, res) => {
  res.json(users);
});

//Rendering the Main Page
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser (urlDatabase, req.session.userID),
    userID: req.session.userID,
    user : users[req.session.userID],
  };
  res.render("urls_index", templateVars);
});

//Rendering the new url page, and redirects the user if they are not logged in
app.get("/urls/new", (req, res) => {
  if(!req.session.userID){
    return res.redirect("/login");
  }
  const templateVars = {
    userID: req.session.userID,
    user: users[req.session.userID],
  };
  res.render("urls_new", templateVars);
});

//Redirecting user to their modified shorturl page with edit, or there will be an error for users if that page doesn't belogn to them
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (!urlDatabase[shortURL]) {
    const templateVars = {
      user: users[req.session.userID],
      error: "This is not a valid link!",
    };
    return res.status(403).render("errors", templateVars);
  }
  if (req.session.userID !== urlDatabase[shortURL].userID) {
    const templateVars = {
      user: users[req.session.userID],
      error: "Oops! You are not authorized to edit this!"
    };
    res.status(403).render("errors", templateVars);
  }
  const templateVars = { longURL: longURL, shortURL: shortURL, user: users[req.session.userID] };
  res.render("urls_show", templateVars);
});

//Redirects that manages the shortURL link and will redirect the user to the longURL link 
app.get("/u/:shortURL", (req, res) => { 
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//Renders the sign up page
app.get('/register', (req, res) => {
  const templateVars ={
    user: users[req.session.userID],
  };
  res.render("user_registeration", templateVars)
});

//Renders the login page
app.get("/login", (req, res) => {
  const templateVars = {
    userID: null,
    user: users[req.session.userID],
  }
    res.render("user_login", templateVars);
  });

//Renders an error page if link doesnt exist
app.get("Doesnt exist", (req, res) => {
  const templateVars = {
    user: users[req.session.userID],
    error: "Status 404: This page does not exist!  Please click one of the links above!",
  };
  return res.status(404).render("errors", templateVars);
});

//POST ROUTE HANDLERS
//Adds a new random generated shortURl to the url page, redirects the user to login if they arent loged in
app.post("/urls", (req, res) => {
  if (!req.session.userID) {
    return res.redirect("/login");
  }
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURL, userID: req.session.userID };
  res.redirect(`/urls/${shortURL}`); 
});

//deletes url only if belongs to the user
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  if (req.session.userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls/");
  } else {
    const templateVars = {
      user: users[req.session.userID],
      error: "Not authorized to delete this",
    };
    return res.status(400).render("errors", templateVars);
  }
});

//Edit an existing url only if it belongs to that user
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.userID !== urlDatabase[shortURL].userID) {
    return res.send("Not authorized to edit this"); 
  }
  urlDatabase[shortURL].longURL = req.body.newURL;
  res.redirect("/urls/");
});

//checks for valid login credentials and redirects to url page
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = getUserByEmail(email, users);
  if (!email || !password) {
    const templateVars = {
      user: users[req.session.userID],
      error: "Status 400: You left a field empty",
    };
    return res.status(400).render("errors", templateVars);
  }
  if (!userID) {
    const templateVars = {
      user: users[req.session.userID],
      error: "An account does not exist!",
    };
    return res.status(403).render("errors", templateVars);
  }
  if (!bcrypt.compareSync(password, users[userID].password)) {
    const templateVars = {
      user: users[req.session.userID],
      error: "You entered the wrong password.",
    };
    return res.status(403).render("errors", templateVars);
  }
  req.session.userID = userID;
  return res.redirect("/urls");
});

//Request to logut of users account and deletes cookies after logout
app.post("/logout", (req, res) => {
  res.session = null;
  res.redirect("/urls");
});

//Request to sign up for new account, and checks if the account already exists
app.post("/register", (req, res) => {
  let email = req.body.email;
  if (!req.body.email || !req.body.password) {
    const templateVars = {
      user: users[null],
      error: "The email or password was left empty. Please try again.",
    };
    return res.status(403).render("errors", templateVars);
  }

  const userID = getUserByEmail(email, users);
  if (userID) {
    const templateVars = {
      user: users[null],
      error: "The account already exists.",
    };
    return res.status(400).render("errors", templateVars);
  } 
  
  //Generates a alphanumeric ID for the user
  let ID = generateRandomString();
  //coverts the password to hash using salt
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[ID] = {
    id: ID,
    email: req.body.email,
    password: hashedPassword,
  };
  req.session.userID = ID;
  res.redirect("/urls");
});

//PORT LISTENER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
