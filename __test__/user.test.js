process.env.NODE_ENV = "test";
const User = require("../src/models/user.model")
const mongoose = require('mongoose');
const crypto = require('../src/helpers/crypto.helper')
const toBeType = require("jest-tobetype")
const request = require("supertest");
const app = require("../app");

expect.extend(toBeType);

let token, id

beforeAll(async () => {
  await User.deleteMany({})
});

const email = "dinesh@mail.com"
const password = "123456"

afterAll(async () => mongoose.disconnect());

// beforeEach(async () => console.log("Before"))
// afterEach(async () => console.log("After"))

describe("User Auth", () => {
  test("User signup", async () => {
    let body = {
      email,
      password
    }
    const response = await request(app).post("/api/v1/user/user_signup").send(body);
    expect(response.statusCode).toBe(200);
  });
  test("User login", async () => {
    let body = {
      email,
      password
    }
    const response = await request(app).post("/api/v1/user/user_login").send(body);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.token).toBeType("string");
    token = response.body.token
  }); 

  test("Forget password", async () => {
    let body = {
      email
    }
    const response = await request(app).post("/api/v1/user/forget_password").send(body);
    expect(response.statusCode).toBe(200);
  });

  test("Reset password", async () => {
    let email = crypto.encrypt(email);
    let user = await User.findOne({ email: email })
    id = user._id
    let body = {
      reset_password_hash: user.reset_password_hash,
      password: "1234567890"
    }
    const response = await request(app).post("/api/v1/user/reset_password").send(body);
    expect(response.statusCode).toBe(200);
  });

  test("View User", async () => {
    const response = await request(app).post("/api/v1/user/view/" + id).set('authorization', token).send();
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toBeType("object");
    expect(response.body.data).toHaveProperty("_id");
  });

  test("Edit User", async () => {
    let body = {
      first_name: "dinesh"
    }
    const response = await request(app).post("/api/v1/user/edit_user").set('authorization', token).send(body);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toBeType("object");
    expect(response.body.data.first_name).toBe(body.first_name);
  });

  test("Logout", async () => {
    const response = await request(app).post("/api/v1/user/logout").set('authorization', token).send();
    expect(response.statusCode).toBe(200);
  });
});