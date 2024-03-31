const {Router} = require('express');
const {registerUser, loginUser, getUser,getAuthors,changeAvatar,editUser} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");



const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:id", getUser);
router.get("/", getAuthors);
router.post("/change-avatar", authMiddleware, changeAvatar);
router.patch("/edit-user", authMiddleware, editUser);

module.exports = router;