const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json()); // for parsing application/json

const dbPath = path.join(__dirname, "test.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(4000, () => {
      console.log("Backend Server Running at http://localhost:4000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/", (request, response) => {
  response.send("Hello World");
});

app.get("/createtable/", async (request, response) => {
  const createUserQuery = `
    CREATE TABLE users (
        UserID INT AUTO_INCREMENT PRIMARY KEY,
        Username VARCHAR(50) NOT NULL,
        Email TEXT NOT NULL,
        Password TEXT NOT NULL,
        firstname VARCHAR(200) NOT NULL,
        lastname VARCHAR(200) NOT NULL
    );`;
  await db.run(createUserQuery, (error) => {
    if (error) {
      console.error("Error Creating User table:", err);
      response.status(500);
      response.send("Internal Server Error");
    } else {
      response.send("User table Created Successfully");
    }
  });
});

app.post("/users/", async (request, response) => {
  const { UserID, username, email, password, firstName, lastName } =
    request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM users WHERE Username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const createUserQuery = `
        INSERT INTO 
        users (UserID,Username,Email,Password,firstname,lastname)
        VALUES (
            ${UserID},
            '${username}',
            '${email}',
            '${hashedPassword}',
            '${firstName}','${lastName}');`;
    await db.run(createUserQuery);
    response.send("User Created Successfully");
  } else {
    response.status(400);
    response.send("User Already Exists");
  }
});

app.get("/users/", async (request, response) => {
  const getUserQuery = `
        SELECT * FROM Users;
    `;
  const message = await db.all(getUserQuery);
  response.send(message);
});
