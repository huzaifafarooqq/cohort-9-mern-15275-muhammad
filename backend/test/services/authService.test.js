const { expect } = require("chai");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
const {
  registerUser,
  loginUser,
  getUserById,
} = require("../../services/authService");

describe("Auth Service", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("registerUser", () => {
    it("should return userExists when the email is already registered", async () => {
      sinon.stub(User, "findOne").resolves({
        email: "test@example.com",
      });

      const result = await registerUser({
        fullName: "Test User",
        email: "test@example.com",
        password: "123456",
      });

      expect(result).to.deep.equal({
        userExists: true,
      });
    });

    it("should create a user and return an access token", async () => {
      sinon.stub(User, "findOne").resolves(null);
      sinon.stub(User.prototype, "save").resolves();
      sinon.stub(jwt, "sign").returns("test-token");

      const result = await registerUser({
        fullName: "Test User",
        email: "test@example.com",
        password: "123456",
      });

      expect(result.userExists).to.equal(false);
      expect(result.user.fullName).to.equal("Test User");
      expect(result.user.email).to.equal("test@example.com");
      expect(result.accessToken).to.equal("test-token");
      expect(User.prototype.save.calledOnce).to.equal(true);
    });
  });

  describe("loginUser", () => {
    it("should return not-found when the user does not exist", async () => {
      sinon.stub(User, "findOne").resolves(null);

      const result = await loginUser({
        email: "missing@example.com",
        password: "123456",
      });

      expect(result).to.deep.equal({
        status: "not-found",
      });
    });

    it("should return invalid when the password is incorrect", async () => {
      sinon.stub(User, "findOne").resolves({
        email: "test@example.com",
        password: "correct-password",
      });

      const result = await loginUser({
        email: "test@example.com",
        password: "wrong-password",
      });

      expect(result).to.deep.equal({
        status: "invalid",
      });
    });

    it("should return the user and access token for valid credentials", async () => {
      const user = {
        _id: "user-1",
        email: "test@example.com",
        password: "123456",
      };

      sinon.stub(User, "findOne").resolves(user);
      sinon.stub(jwt, "sign").returns("test-token");

      const result = await loginUser({
        email: "test@example.com",
        password: "123456",
      });

      expect(result.status).to.equal("success");
      expect(result.user).to.equal(user);
      expect(result.accessToken).to.equal("test-token");
    });
  });

  describe("getUserById", () => {
    it("should find a user by id", async () => {
      const user = {
        _id: "user-1",
        fullName: "Test User",
      };

      const findOneStub = sinon.stub(User, "findOne").resolves(user);

      const result = await getUserById("user-1");

      expect(findOneStub.calledOnceWith({ _id: "user-1" })).to.equal(true);
      expect(result).to.equal(user);
    });
  });
});