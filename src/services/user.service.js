const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const _ = require('lodash')

module.exports = {
  createUser: async (body) => {
    const createUser = await User.create(body)
    return createUser
  },
  updateUser: async (find, update) => {
    const updateUser = await User.updateOne(find, update)
    if (updateUser.n === 0) {
      return false
    }
    return true
  },
  getUser: async (findQuery) => {
    const getUser = await User.findOne(findQuery)
    if (_.isEmpty(getUser)) {
      return false
    }
    return getUser
  },
  userDetails: async (id, email) => {
    let query = {
      _id: id
    }
    if (email) {
      delete query._id
      query.email = email
    }
    let user = await User.findOne(query, null, null)
    return user
  },
  getMultipleUsers: async (query) => {
    let users = await User.find(query)
    return users
  },
  generateToken: async (id, email, role) => {
    let expiry = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365)
    let token = jwt.sign({ exp: expiry, data: { id, email, role } }, process.env.SECRET);
    token = "Bearer " + token;
    return token
  },
}