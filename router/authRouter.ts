import express from 'express';
import { deleteUser, registerUser, signInUser, verifiedUser, viewAllUsers, viewOneUsers } from '../controller/authController';
import verifyHolder from '../utils/verifyHolder';
import { createAccount, signInAccount } from '../utils/verification';

const router = express.Router();

router.route("/").get(viewAllUsers)
router.route("/:userID/single-user").get(viewOneUsers)
router.route("/register").post(verifyHolder(createAccount),registerUser)
router.route("/sign-in").post(verifyHolder(signInAccount),signInUser)
router.route("/:userID/verified").get(verifiedUser)
router.route("/:userID/delete").delete(deleteUser)

export default router;