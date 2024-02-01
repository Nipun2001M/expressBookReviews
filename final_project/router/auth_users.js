const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
let validusers = users.filter((user)=>{
  return (user.username === username && user.password === password)
});
if(validusers.length > 0){
  return true;
} else {
  return false;
}

}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }
 if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
  
});

// Add a book review
// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const ISBN = req.params.isbn;
  const username = req.session.authorization.username;
  const reviewText = req.body.review;

  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const book = Object.values(books).find(b => b.isbn === ISBN);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  
  if (!book.reviews) {
    book.reviews = {};
  }

  
  if (book.reviews[username]) {
    
    book.reviews[username] = reviewText;
    return res.status(200).json({ message: "Review modified successfully", user: { username } });
  } else {
    
    book.reviews[username] = reviewText;
    return res.status(200).json({ message: "Review added successfully", user: { username } });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const ISBN = req.params.isbn;
  const username = req.session.authorization.username;

  const book = Object.values(books).find(b => b.isbn === ISBN);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  }

  // Ensure book.reviews is an object
  if (typeof book.reviews !== 'object') {
    book.reviews = {};
  }

  // Delete the review associated with the session username
  delete book.reviews[username];

  return res.status(200).json({ message: "Review deleted successfully", user: { username } });
});




module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
