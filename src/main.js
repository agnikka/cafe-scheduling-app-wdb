// Note: commented former code preserved due to educational reasons

const express = require("express");
const app = express();
const path = require("path");
const { Sequelize } = require("sequelize");
const { sequelize, Schedule, User } = require("../models");
const ejs = require("ejs");
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const saltRounds = 5;
const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);
app.use(express.static("./public/css"));

app.set("view engine", "ejs");
app.set("./views", path.join(__dirname, "views"));
app.set("layout", "layout");

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database: ", err);
  });

// TOKENS
app.use((req, res, next) => {
  const authToken = req.cookies["AuthToken"];
  req.user = authTokens[authToken];
  next();
});

const generateAuthToken = () => {
  return crypto.randomBytes(30).toString("hex");
};

const authTokens = {};

const requireAuth = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.render("logForm", { title: "Log in" });
  }
};

// BCRYPT
const getHashedSaltedPassword = (password) => {
  const hash = bcrypt.hashSync(password, saltRounds);
  return hash;
};

// SIGNUP
app.get("/signup", async (req, res) => {
  res.render("regForm", { title: "Sign up" });
});

app.post("/signup", async (req, res) => {
  try {
    const { lastname, firstname, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      res.status(500).render("error", { title: "error", text: "Passwords do not match" });
      return
    }
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      res.status(400).render("error", { title: "error", text: "Email already registered." });
      return
    }
    const hashedSaltedPassword = getHashedSaltedPassword(password);
    const user = User.create({
      lastname,
      firstname,
      email,
      password: hashedSaltedPassword,
    });
    res.redirect("/login");
  } catch (err) {
    res.status(500).render("error", { title: "error", text: "Registration unsuccesful. ", err });
  }
});

// LOGIN & LOGOUT
app.get("/login", async (req, res) => {
  res.render("logForm", { title: "Log in" });
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // const hashedSaltedPassword = getHashedSaltedPassword(password);
    // const users = User.findAll();
    const user = await User.findOne({
      where: { email}, // password: hashedSaltedPassword 
    });

    if (user && bcrypt.compareSync(password, user.password)) {
      const authToken = generateAuthToken();
      authTokens[authToken] = user;
      res.cookie("AuthToken", authToken);
      res.redirect("/");
    }
  } catch (err) {
    res.status(500).render("error", {
      title: "error",
      text: "Invalid username or password",
    });
  }
});

app.get("/logout", async (req, res) => {
  res.clearCookie("AuthToken");
  res.redirect("/login");
});

// ALL SCHEDULES
app.get("/", requireAuth, async (req, res) => {
  const schedules = Schedule.findAll()
    // const users = User.findAll()
    .then((schedules) => {
      res.render("homeSchedules", { title: "Schedules", schedules });
    })
    .catch((err) => {
      res.status(500).render("error", {
        title: "error",
        text: "Something went wrong. ",
        err,
      });
    });
});

// NEW SCHEDULE
app.get("/new", requireAuth, async (req, res) => {
  res.render("newScheduleForm", { title: "New Schedule" });
});

app.post("/new", requireAuth, async (req, res) => {
  user = req.user;
  const ID_user = user.id;
  const { day, start_at, end_at } = req.body; //ID_user, 
  try {
    const schedule = await Schedule.create({ ID_user, day, start_at, end_at });
    res.redirect("/new");
  } catch (err) {
    res
      .status(500)
      .render("error", { title: "error", text: "Something went wrong. ", err });
  }
});

// SPECIFIC USER
app.get("/users/:userId", requireAuth, async (req, res) => {
  const currentUser = req.user;
  const userId = currentUser.id;
  try {
    const user = await User.findOne({
      where: { id: userId },
      include: "schedules",
    });
    res.render("userSite", { title: "User's site", users, user, userId, schedules });
  } catch (err) {
    res.status(500).render("error", { title: "error", text: "Incorrect ID" });
  }
});

app.listen(port, async () => {
  console.log(`App running on http://localhost:${port}`);
  // await sequelize.sync({ alter: true });
  console.log("Database synced");
});
