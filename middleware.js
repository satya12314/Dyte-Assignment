import chalk from "chalk";
import CONFIGURATION from "./config.json" assert { type: "json" };
import { User } from "./models/models.user.js";
import { VerifyToken } from "./utils.js";

const CheckUserAccessForQueries = async (req, res, next) => {
  try {
    const role = req.userInDb.role;
    const rolePermissions = CONFIGURATION.access_types[role];
    req.rolePermissions = rolePermissions;
    const queryKeys = Object.keys(req.query);
    const allKeysInRolePermissions = queryKeys.every((key) => {
      return rolePermissions.includes(key);
    });
    if (!allKeysInRolePermissions) throw new Error();
    next();
  } catch (error) {
    console.log(chalk.red("Error : [CHECK USER ACCESS FOR QUERIES]"), error);
    return res.status(401).json({ message: "Access Denied : User Cannot Access These Queries" });
  }
};

const CheckIfUserAuthenticated = async (req, res, next) => {
  try {
    // Format be like Bearer `${tokenValue}`
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = await VerifyToken(token);
    req.userId = decodedToken._id;
    const userInDb = await User.findById(req.userId);

    if (!userInDb) {
      throw new Error("");
    }

    req.userInDb = userInDb;
    next();
  } catch (error) {
    console.log(chalk.red("Error : [CHECK IF USER AUTHENTICATED]"), error);
    return res.status(401).json({
      message: "Access Denied : User Not Authenticated For Doing Any Queries",
    });
  }
};

export { CheckIfUserAuthenticated, CheckUserAccessForQueries };
