import express from "express";
import bodyParser from "body-parser";
import chalk from "chalk";
import { MONGODB_URI, PORT } from "./config.js";
import mongoose from "mongoose";
import { CheckIfUserAuthenticated, CheckUserAccessForQueries } from "./middleware.js";
import { InjectData, QuerySearch } from "./services.js";
import CONFIG from "./config.json" assert { type: "json" };
import { User } from "./models/models.user.js";
import bcrypt from "bcrypt";
import { CreateToken } from "./utils.js";
import cors from "cors";

const app = express();
const log = console.log;

app.use(bodyParser.json());
app.use(bodyParser({ limit: "50mb" }));
app.use(cors());

if (process.env.NODE_ENV !== "production") {
  app.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    try {
      const userInDb = await User.findOne({ username });

      if (userInDb) {
        return res.status(401).json({ status: "error" });
      }

      const hashedPass = await bcrypt.hash(password, 10);

      const { _id } = await User.create({
        username,
        password: hashedPass,
      });

      const token = CreateToken({
        _id,
      });

      return res.json({
        status: "success",
        data: {
          token: token,
        },
      });
    } catch (error) {
      log(chalk.red("Error [SIGNUP USER] :"), error);
      return res.status(500).json({ status: "error" });
    }
  });
}

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ status: "error" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ status: "error" });
    }

    const token = CreateToken({
      _id: user._id,
    });

    return res.json({
      status: "success",
      data: {
        token: token,
      },
    });
  } catch (error) {
    log(chalk.red("Error [LOGIN USER] :"), error);
    return res.status(500).json({ status: "error" });
  }
});

app.post("/injest", async (req, res) => {
  try {
    // Considering that the payload is an array of json objects
    const payload = req.body;
    await InjectData(payload);
    return res.json({ status: "success" });
  } catch (error) {
    log(chalk.red("Error [INJETING LOGS] : "), error);
    return res.status(500).json({ status: "error" });
  }
});

app.post("/search", [CheckIfUserAuthenticated, CheckUserAccessForQueries], async (req, res) => {
  try {
    let queries = req.query;
    if (queries?.level) queries.level = queries.level.split(",");
    const data = await QuerySearch(queries, req.rolePermissions);
    return res.json({ status: "success", length: data.length, data });
  } catch (error) {
    log(chalk.red("Error [QUERING FOR LOGS] : "), error);
    return res.status(500).json({ status: "error" });
  }
});

function startServer() {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      log(chalk.blue("Log : [CONNECTED TO MONGODB]"));
      app.listen(PORT, () => {
        log(chalk.blue("Log : [SERVER STARTED]"), PORT);
      });
    })
    .catch((err) => {
      log(chalk.red("Error [CONNECTION TO MONGODB] :"), err);
    });
}

startServer();
