import express from "express";
import {
  Login,
  SignUp,
  getFriends,
  AddFriend,
  getUserData,
  changeOnlineStatus,
} from "../controllers/UserController.js";
import { userAuth } from "../middleware/userAuth.js";

const userRouter = express.Router();
// User routes
userRouter.post("/signup", SignUp);
userRouter.post("/login", Login);
userRouter.get("/getFriends", userAuth, getFriends);
userRouter.get("/getUserData", userAuth, getUserData);
userRouter.post("/addFriend", userAuth, AddFriend);
userRouter.post("/changeOnlineStatus", userAuth, changeOnlineStatus);
export default userRouter;
