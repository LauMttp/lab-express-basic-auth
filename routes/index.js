const router = require("express").Router();
const User = require("../models/User.model");
const isAuthenticated = require("../middleware/isAuthenticated");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const salt = 10;

/* GET default route */
router.get("/", (req, res, next) => {
  res.json({ success: true });
});

router.post("/signup", async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please, provide a password and an username." });
  }
  try {
    const foundUsername = await User.findOne({ username });
    console.log(foundUsername);
    if (foundUsername) {
      return res.status(400).json({
        message:
          "This username already exist, please try with another username.",
      });
    }
    const generatedSalt = bcrypt.genSaltSync(salt);
    const hashedPassword = bcrypt.hashSync(password, generatedSalt);
    const userToBeCreated = {
      username,
      password: hashedPassword,
    };
    const userCreated = await User.create(userToBeCreated);
    res.status(201).json(userCreated);
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please, provide a password and an username." });
  }
  try {
    const foundUsername = await User.findOne({ username });
    if (!foundUsername) {
      return res.status(400).json({
        message: "Username not found, please check typo or create an account",
      });
    }
    const checkPassword = bcrypt.compareSync(password, foundUsername.password);
    if (!checkPassword) {
      return res
        .status(400)
        .json({ message: "Incorrect Password, try againnn!" });
    }

    const payload = { username };
    const token = jsonwebtoken.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "5h",
    });
    res.status(200).json(token);
  } catch (error) {
    next(error);
  }
});

router.get("/main", isAuthenticated, async (req, res, next) => {
  try {
    console.log("Tu es dans la route protégée", req.user);
    res.json({
      image:
        "https://m.facebook.com/136276193081711/photos/a.136276396415024/3510000052375958/?type=3",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/private", isAuthenticated, async (req, res, next) => {
  try {
    console.log(
      "Hi Console ! You are in the private protected by authentification route",
      req.user
    );
    res.json({
      message: "You are in the private protected by authentification route",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
