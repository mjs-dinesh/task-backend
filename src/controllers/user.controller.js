const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const moment = require("moment")
const crypto = require('../helpers/crypto.helper')
const UserService = require('../services/user.service')

module.exports = {

  verifyToken: async (req, res, next) => {
    try {
      let token = req.headers['authorization'];
      if (!token)
        return res.status(403).send({ auth: false, message: 'No token provided.' });
      if (!token.includes("Bearer "))
        return res.status(403).send({ auth: false, message: 'Invalid token' });

      token = token.replace('Bearer ', '');
      let decoded = await jwt.verify(token, process.env.SECRET);
      if (decoded) {
        decoded = decoded.data;
        let user = await UserService.userDetails(decoded.id);
        if (user) {
          req.decoded = decoded;
          next();
        } else {
          return res.status(403).send({ auth: false, message: 'Failed to authenticate token' });
        }
      } else {
        return res.status(403).send({ auth: false, message: 'Failed to authenticate token.' });
      }
    } catch (err) {
      err.desc = "Invalid Token"
      next(err)
    }
  },

  userSignup: async (req, res, next) => {
    try {
      let email = crypto.encrypt(req.body.email);
      let user = await UserService.userDetails(undefined, email);
      if (!user) {
        let hash = await bcrypt.hash(req.body.password, saltRounds)
        req.body.password = hash
        req.body.email = email;
        // Store hash in your password DB.
        await UserService.createUser(req.body)
        res.send({ status: "success", message: "User Created Successfully" })
      } else {
        res.status(422).send({ status: "failed", message: "Email Already Exists" })
      }
    } catch (error) {
      error.desc = "Signup failed"
      next(error)
    }
  },

  userLogin: async (req, res, next) => {
    try {
      let email = crypto.encrypt(req.body.email);
      let user = await UserService.userDetails(undefined, email);
      if (user && user.password) {
        user.email = crypto.decrypt(user.email);
        let isTrue = await bcrypt.compare(req.body.password, user.password);
        if (isTrue) {
          let token = await UserService.generateToken(user._id, user.email, user.role)
          res.send({ status: "success", message: "user exist", token, role: user.role, data: user })
          let session_id = mongoose.Types.ObjectId();
          let session = {
            id: session_id,
            login: new Date()
          }
          const findQuery = { email }
          const updateBody = { $push: { session: session }, session_id: session_id }
          await UserService.updateUser(findQuery, updateBody)
        } else {
          res.status(422).send({ status: "failed", message: "Incorrect password" })
        }
      } else {
        res.status(422).send({ status: "failed", message: "User doesn't exist" })
      }
    } catch (err) {
      err.desc = "Failed to login"
      next(err);
    }
  },

  //Forget Password
  forgetPassword: async (req, res, next) => {
    try {
      let email = crypto.encrypt(req.body.email);
      let user = await UserService.userDetails(undefined, email);
      if (user) {
        //Send mail
        let id = mongoose.Types.ObjectId();
        let body = {
          reset_password_expiry: moment().add(1, "days"),
          reset_password_hash: id
        }
        await UserService.updateUser({ email: email }, body)
        res.send({ status: "success", message: "success", data: id });

      } else {
        res.status(409).send({ status: "failed", message: "User doesn't Exist" });
      }
    } catch (err) {
      err.desc = "Failed to Forget Password";
      next(err)
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      let user = await UserService.getUser({ reset_password_hash: req.body.reset_password_hash });
      if (user) {
        let hash = await bcrypt.hash(req.body.password, saltRounds);
        let reset_password_hash = mongoose.Types.ObjectId();
        await UserService.updateUser({ reset_password_hash: req.body.reset_password_hash }, { password: hash, reset_password_hash });
        res.send({ status: "success", message: "Password Changed" })
      } else {
        res.status(409).send({ status: "failed", message: "Incorrect Credentials" })
      }
    } catch (err) {
      err.desc = "Failed to Reset Password";
      next(err);
    }
  },

  editUser: async (req, res, next) => {
    try {
      let user = await UserService.userDetails(req.decoded.id);
      if (user) {
        await UserService.updateUser({ _id: req.decoded.id }, { $set: req.body });
        let editedUser = await UserService.userDetails(user._id);
        editedUser.email = req.decoded.email
        res.send({ status: "success", message: "User modified", data: editedUser })
      } else {
        res.status(409).send({ status: "failed", message: "User doesn't exist" })
      }
    } catch (err) {
      err.desc = "Failed to edit user";
      next(err);
    }
  },

  viewUser: async (req, res, next) => {
    try {
      let id = req.decoded.id
      if (req.body.user_id) {
        id = req.body.user_id
      }
      let user = await UserService.userDetails(id);
      if (user) {
        user.email = req.decoded.email
        res.send({ status: "success", message: "User fetched", data: user })
      } else {
        res.status(409).send({ status: "failed", message: "User doesn't exist" })
      }
    } catch (err) {
      err.desc = "Failed to get user";
      next(err);
    }
  },

  logout: async (req, res, next) => {
    try {
      let user = await UserService.userDetails(req.decoded.id);
      //Find index of specific object using findIndex method.    
      let index = user.session.findIndex((obj => obj.id.toString() == user.session_id.toString()));
      if (user.session[index]) {
        user.session[index].logout = new Date()
      }
      await UserService.updateUser({ _id: req.decoded.id }, { session: user.session })
      res.send({ status: "success", message: "User logged out successfully" })
    } catch (err) {
      err.desc = "Failed to Logout";
      next(err);
    }
  },
}
