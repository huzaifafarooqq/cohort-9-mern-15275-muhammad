const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("Auth Controller", () => {
  let authService;
  let logger;
  let authController;

  beforeEach(() => {
    authService = {
      registerUser: sinon.stub(),
      loginUser: sinon.stub(),
      getUserById: sinon.stub(),
    };

    logger = {
      info: sinon.spy(),
    };

    authController = proxyquire("../../controllers/authController", {
      "../services/authService": authService,
      "../logger": logger,
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  const createResponse = () => ({
    status: sinon.stub().returnsThis(),
    json: sinon.spy(),
    sendStatus: sinon.spy(),
  });

  describe("createAccount", () => {
    it("should return 400 when fullName is missing", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "123456",
        },
      };

      const res = createResponse();
      const next = sinon.spy();

      await authController.createAccount(req, res, next);

      expect(res.status.calledOnceWith(400)).to.equal(true);
      expect(
        res.json.calledOnceWith({
          error: true,
          message: "Full Name is required",
        }),
      ).to.equal(true);
      expect(authService.registerUser.called).to.equal(false);
    });

    it("should return an error when the user already exists", async () => {
      authService.registerUser.resolves({
        userExists: true,
      });

      const req = {
        body: {
          fullName: "Test User",
          email: "test@example.com",
          password: "123456",
        },
      };

      const res = createResponse();
      const next = sinon.spy();

      await authController.createAccount(req, res, next);

      expect(
        res.json.calledOnceWith({
          error: true,
          message: "User already exist",
        }),
      ).to.equal(true);
    });

    it("should return the user and token after successful registration", async () => {
      const user = {
        _id: "user-1",
        fullName: "Test User",
        email: "test@example.com",
      };

      authService.registerUser.resolves({
        userExists: false,
        user,
        accessToken: "test-token",
      });

      const req = {
        body: {
          fullName: "Test User",
          email: "test@example.com",
          password: "123456",
        },
      };

      const res = createResponse();
      const next = sinon.spy();

      await authController.createAccount(req, res, next);

      expect(
        authService.registerUser.calledOnceWith({
          fullName: "Test User",
          email: "test@example.com",
          password: "123456",
        }),
      ).to.equal(true);

      expect(
        res.json.calledOnceWith({
          error: false,
          user,
          accessToken: "test-token",
          message: "Registration Successful",
        }),
      ).to.equal(true);

      expect(logger.info.calledOnce).to.equal(true);
    });
  });

  describe("login", () => {
    it("should return 400 when email is missing", async () => {
      const req = {
        body: {
          password: "123456",
        },
      };

      const res = createResponse();
      const next = sinon.spy();

      await authController.login(req, res, next);

      expect(res.status.calledOnceWith(400)).to.equal(true);
      expect(
        res.json.calledOnceWith({
          message: "Email is required",
        }),
      ).to.equal(true);
      expect(authService.loginUser.called).to.equal(false);
    });

    it("should return 400 when the user is not found", async () => {
      authService.loginUser.resolves({
        status: "not-found",
      });

      const req = {
        body: {
          email: "missing@example.com",
          password: "123456",
        },
      };

      const res = createResponse();
      const next = sinon.spy();

      await authController.login(req, res, next);

      expect(res.status.calledOnceWith(400)).to.equal(true);
      expect(
        res.json.calledOnceWith({
          error: true,
          message: "Invalid email or password",
        }),
      ).to.equal(true);
    });

    it("should return 400 for invalid credentials", async () => {
      authService.loginUser.resolves({
        status: "invalid",
      });

      const req = {
        body: {
          email: "test@example.com",
          password: "wrong-password",
        },
      };

      const res = createResponse();
      const next = sinon.spy();

      await authController.login(req, res, next);

      expect(res.status.calledOnceWith(400)).to.equal(true);
      expect(
        res.json.calledOnceWith({
          error: true,
          message: "Invalid email or password",
        }),
      ).to.equal(true);
    });

    it("should return a token after successful login", async () => {
      authService.loginUser.resolves({
        status: "success",
        accessToken: "test-token",
      });

      const req = {
        body: {
          email: "test@example.com",
          password: "123456",
        },
      };

      const res = createResponse();
      const next = sinon.spy();

      await authController.login(req, res, next);

      expect(
        res.json.calledOnceWith({
          error: false,
          message: "Login Successful",
          email: "test@example.com",
          accessToken: "test-token",
        }),
      ).to.equal(true);

      expect(logger.info.calledOnce).to.equal(true);
    });
  });

  describe("getUser", () => {
    it("should return 401 when the user does not exist", async () => {
      authService.getUserById.resolves(null);

      const req = {
        user: {
          user: {
            _id: "user-1",
          },
        },
      };

      const res = createResponse();
      const next = sinon.spy();

      await authController.getUser(req, res, next);

      expect(res.sendStatus.calledOnceWith(401)).to.equal(true);
    });

    it("should return the current user", async () => {
      const user = {
        _id: "user-1",
        fullName: "Test User",
        email: "test@example.com",
        createdOn: new Date(),
      };

      authService.getUserById.resolves(user);

      const req = {
        user: {
          user: {
            _id: "user-1",
          },
        },
      };

      const res = createResponse();
      const next = sinon.spy();

      await authController.getUser(req, res, next);

      expect(
        authService.getUserById.calledOnceWith("user-1"),
      ).to.equal(true);

      expect(
        res.json.calledOnceWith({
          user: {
            fullName: user.fullName,
            email: user.email,
            _id: user._id,
            createdOn: user.createdOn,
          },
          message: "",
        }),
      ).to.equal(true);
    });
  });

  it("should pass service errors to next", async () => {
    const error = new Error("Database failed");

    authService.loginUser.rejects(error);

    const req = {
      body: {
        email: "test@example.com",
        password: "123456",
      },
    };

    const res = createResponse();
    const next = sinon.spy();

    await authController.login(req, res, next);

    expect(next.calledOnceWith(error)).to.equal(true);
  });
});