const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const cors = require("cors");
require("dotenv").config();
const authRouter = require("./src/routes/authRouter");
const corpusRouter = require("./src/routes/corpusRouter");
const similarityRouter = require("./src/routes/similarityRouter");
const indexRouter = require("./src/routes/index");
const courseMaterialRoute = require("./src/routes/courseMaterialRouter");
const word2vecRouter = require("./src/routes/word2vecRouter");
const usersRouter = require("./src/routes/usersRouter");
const rolesRouter = require("./src/routes/rolesRouter");

const PORT = process.env.PORT || 8000;
const app = express();

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    credentials: true,
  })
);

app.use(flash());
global.__basedir = path.join(__dirname, "public");
app.use("/img", express.static(path.join(__dirname, "public/img")));
app.use(
  "/converteds/corpus/:name?/:course?",
  express.static(path.join(__dirname, "public/converteds/corpus"))
);
app.use(
  "/uploads/corpus/:name?/:course?",
  express.static(path.join(__dirname, "public/uploads/corpus"))
);
app.use(
  "/converteds/sentence/",
  express.static(path.join(__dirname, "public/converteds/sentence"))
);
app.use(
  "/word2vec/:name?/:course?",
  express.static(path.join(__dirname, "public/converteds/word2vec"))
);

const defaultRoute = "/api/v1";

app.use(defaultRoute, authRouter);
app.use(defaultRoute, indexRouter);
app.use(defaultRoute, courseMaterialRoute);
app.use(defaultRoute, corpusRouter);
app.use(defaultRoute, similarityRouter);
app.use(defaultRoute, word2vecRouter);
app.use(defaultRoute, usersRouter);
app.use(defaultRoute, rolesRouter);

app.use(
  session({
    secret: "webslesson",
    cookie: { maxAge: 60000 },
    saveUninitialized: false,
    resave: false,
  })
);

app.use((req, res) => {
  res.status(404).send("Route tidak ditemukan");
});

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

module.exports = app;
