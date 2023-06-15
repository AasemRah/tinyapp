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

app.get("/urls", (req, res) => {
  const usersId = req.cookies.usersId;
  console.log('usersId---', usersId);
  const templateVars = { urls: urlDatabase,
    username: req.cookies['username'],
    user : users[usersId]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: "username"
  };
  res.render("urls_new", templateVars);

});
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  const templateVars = { longURL: longURL, shortURL: shortURL, username: "username" };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/register', (req, res) => {
  const templateVars ={
    username: req.cookies["username"]
  };
  res.render("user_registeration", templateVars)
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`); 
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls/");
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect("/urls/");
});

app.post("/login/", (req,res) => {
  res.cookie('username', req.body.username)
  res.redirect("/urls/");
  });
  
  app.post("/logout/", (req,res) => {
    res.clearCookie('username', req.body.username)
    res.redirect("/urls/");
    });

app.get("/u/:shortURL", (req, res) => { 
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

  app.post('/register', (req, res) => {
    const { email, password } = req.body;
  
    // Check if the email or password are empty strings
    if (!email || !password) {
      res.status(400).send('Email and password are required');
      return;
    }
  
    // Check if the email already exists in the users object
    for (const userId in users) {
      const user = users[userId];
      if (user.email === email) {
        res.status(400).send('Email already registered');
        return;
      }
    }


  let ID =  generateRandomString();
  users[ID] = {
    id: ID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie('userId', ID);
  console.log('users----',users);
    res.redirect("/urls");

});

//PORT LISTENER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
