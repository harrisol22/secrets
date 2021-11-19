//jshint esversion:6

// dotenv needs to be called as early in the code as possible; creates environment variables
require("dotenv").config()

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");


const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/userdb");

// set up new user database
// instead of creating a vanilla JSON, we use mongoose.Schema to create a new encryptable object
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  const user = new User ({
    email: req.body.username,
    // runs md5 on the entered password to create an un-undoable hash
    password: md5(req.body.password),
  })
// mongoose-encrypt automatically encrypts on save
  user.save(function(err) {
    if(err){
      console.log(err);
    } else
    // only render secrets page from behind the register or login pages
      res.render("secrets");
  });
});

app.post("/login", function(req, res) {
  const username = req.body.username;
  // create hash of inputted password to compare to password hash in database
  const password = md5(req.body.password);
  // check username and password; mongoose-encrypt will automatically decrypt
  User.findOne({email: username}, function(err, foundUser) {
    if(err) {
      console.log(err);
    } else {
      if(foundUser){
        if(foundUser.password === password) {
          res.render("secrets");
        }else {
          res.send("Sorry, wrong password.");
        }
      }else {
        res.send("Sorry, that user does not exist.");
      }
    }
  });
});










app.listen(3000, function() {
  console.log("Server spinning on port 3000.");
});
