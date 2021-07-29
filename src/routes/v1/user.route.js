const express = require('express');
const router = express.Router();
const UserController = require('../../controllers/user.controller')
const Validation = require("../../helpers/validation.helper")
const validator = require('express-joi-validation').createValidator({});


router.post('/user_signup', validator.body(Validation.createUser), UserController.userSignup)

router.post('/user_login', validator.body(Validation.userLogin), UserController.userLogin)

router.post('/forget_password', UserController.forgetPassword)

router.post('/reset_password', validator.body(Validation.resetPassword), UserController.resetPassword)

router.post("/edit_user", validator.body(Validation.editUser), UserController.verifyToken, UserController.editUser);

router.post("/view", UserController.verifyToken, UserController.viewUser);

router.post('/logout', UserController.verifyToken, UserController.logout);

module.exports = router;
