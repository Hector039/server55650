import { Router } from "express";
import UsersController from "../controllers/users.controller.js"
import { usersService } from "../services/index.js";
import { passportCall } from "../middlewares/passportCall.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";
import { isSessionOn } from "../middlewares/isSessionOn.js";
import { userPassJwt } from "../middlewares/userPassJwt.js";
import { uploads } from "../middlewares/multer.js";

const usersController = new UsersController(usersService);
const router = Router();

router.post("/login", isSessionOn(), passportCall("login"), handlePolicies(["PUBLIC"]), usersController.userLogin);
router.post("/signin", isSessionOn(), passportCall("signin"), handlePolicies(["PUBLIC"]), usersController.userSignIn);
router.post("/forgot", isSessionOn(), handlePolicies(["PUBLIC"]), usersController.userForgotPass);
router.get("/passrestoration/:email", isSessionOn(), handlePolicies(["PUBLIC"]), usersController.passRestoration);
router.get("/userverification/:email", isSessionOn(), handlePolicies(["PUBLIC"]), usersController.userVerified);
router.get("/logout", handlePolicies(["PUBLIC"]), usersController.userLogout);
router.get("/github", isSessionOn(), passportCall("github"), handlePolicies(["PUBLIC"]), usersController.gitHub);
router.get("/ghstrategy", isSessionOn(), passportCall("github"), handlePolicies(["PUBLIC"]), usersController.gitHubStrategy);
router.get("/google", isSessionOn(), passportCall("google"), handlePolicies(["PUBLIC"]), usersController.google);
router.get("/googlestrategy", isSessionOn(), passportCall("google"), handlePolicies(["PUBLIC"]), usersController.googleStrategy);
router.get("/premium/:email", userPassJwt(), handlePolicies(["USER", "PREMIUM"]), usersController.premiumSelector);
router.post("/:uid/documents", userPassJwt(), handlePolicies(["USER"]), uploads.fields([{ name: "idDoc" }, { name: "adressDoc" }, { name: "accountDoc" }]), usersController.docs);
router.post("/:uid/avatar", userPassJwt(), handlePolicies(["USER", "PREMIUM"]), uploads.single("avatar"), usersController.avatar);
router.get("/getusers", userPassJwt(), handlePolicies(["ADMIN"]), usersController.getAllUsers);
router.delete("/cleanusers", userPassJwt(), handlePolicies(["ADMIN"]), usersController.cleanUsers);
router.delete("/deleteuser/:uid", userPassJwt(), handlePolicies(["ADMIN"]), usersController.deleteUser);
router.put("/updateuserrole/:uid", userPassJwt(), handlePolicies(["ADMIN"]), usersController.updateUserRole);

export default router;