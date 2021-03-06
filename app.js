//jshint esversion:6

// dotenv needs to be called as early in the code as possible; creates environment variables
require("dotenv").config()

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// salts password hashes for a predetermined number of rounds
const bcrypt = require("bcrypt");
const saltRounds = 10;


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

  // creates hashed and salted password
  bcrypt.hash(req.body.password, saltRounds, function(err, hash){
    const user = new User ({
      email: req.body.username,
      // saves hashed password
      password: hash,
    })
    user.save(function(err) {
      if(err){
        console.log(err);
      } else
      // only render secrets page from behind the register or login pages
        res.render("secrets");
    });
  });

});

app.post("/login", function(req, res) {

  const username = req.body.username;
  const password = req.body.password;
  // check username and password
  User.findOne({email: username}, function(err, foundUser) {
    if(err) {
      console.log(err);
    } else {
      if(foundUser){
        // check salted and hashed password against database
        bcrypt.compare(password, foundUser.password, function(err, result){
          if (result === true){
            res.render("secrets");
          };
        });
      }else {
        res.send("Sorry, that user does not exist.");
      }
    }
  });
});










app.listen(3000, function() {
  console.log("Server spinning on port 3000.");
});
