/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const comparePassword = require("./../utils/comparePassword");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const maxAge = 3 * 24 * 60 * 60;

const createToken = (id, email) => {
  return jwt.sign({ id: id, email: email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: maxAge,
  });
};

// Insert a user
exports.registerUser = (req, res) => {
  const pool = req.pool;
  pool.getConnection((err, connection) => {
    if (err) throw err;
    const {
      user_id,
      user_name,
      full_name,
      email,
      password: Npassword,
      phone_number,
    } = req.body; // Destructure user_id and Name from req.body
    if (!email || !Npassword)
      return res.json({
        status: "error",
        error: "Please enter your email and password",
      });
    else {
      connection.query(
        "SELECT email FROM user WHERE email=?",
        [email],
        (err, result) => {
          // connection.release();
          if (err) throw err;
          if (result && result.length > 0)
            // Check if email already exists
            return res.json({
              status: "failure",
              error: "Email has already been registered",
            });
          else {
            // Hash the password using bcrypt
            bcrypt.hash(Npassword, 8, (err, password) => {
              if (err) throw err;
              // Insert user into the database
              connection.query(
                "INSERT INTO user (user_id, user_name,full_name,email, password,phone_number) VALUES (?, ?, ?, ?,?,?)",
                [user_id, user_name, full_name, email, password, phone_number],
                (err, rows) => {
                  connection.release();
                  const token = createToken(user_id, email);
                  if (!err) {
                    res.cookie("jwt", token, {
                      httpOnly: true,
                      maxAge: maxAge * 1000,
                    });
                    res.status(201).json({ user: user_id, email });
                  } else {
                    console.log(err);
                    res.json({
                      status: "failure",
                      error: "Failed to register user",
                    });
                  }
                },
              );
            });
          }
        },
      );
    }
  });
};
exports.loginUser = (req, res) => {
  const { email, password: checkPassword } = req.body;
  const pool = req.pool;
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(
      "SELECT user_id,email,password FROM user WHERE email=?",
      [email],
      async (err, result) => {
        connection.release();
        if (err) {
          // Handle the error
          console.log("Error retrieving user:", err);
          return res
            .status(500)
            .json({ status: "error", error: "Internal Server Error" });
        }
        if (result.length === 0) {
          // If user not found, send appropriate response
          return res
            .status(404)
            .json({ status: "error", error: "User not found" });
        }
        if (result.length === 1) {
          const storedPassword = result[0].password;
          const storedEmail = result[0].email;
          const stored_user_id = result[0].user_id;
          // console.log(user_id);
          try {
            const passwordsMatch = await comparePassword(
              checkPassword,
              storedPassword,
            );
            if (passwordsMatch) {
              const token = createToken(stored_user_id, email);
              res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: maxAge * 1000,
              });
              res
                .status(201)
                .json({ user_id: stored_user_id, email: storedEmail });
            } else {
              return res
                .status(401)
                .json({ status: "failure", failure: "Incorrect Password" });
            }
          } catch (error) {
            console.error("Error comparing passwords:", error);
            return res
              .status(500)
              .json({ status: "error", error: "Internal Server Error" });
          }
        }
      },
    );
  });
};

exports.logoutUser = (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  // res.redirect("/");
  res.status(200).json({ success: "Redirecting to Landing Page" });
};
