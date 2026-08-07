const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("Request Logger Middleware", () => {
  let logger;
  let requestLogger;

  beforeEach(() => {
    logger = {
      info: sinon.spy(),
    };

    requestLogger = proxyquire("../middleware/requestLogger", {
      "../logger": logger,
    });
  });

  it("should log the incoming request and call next()", () => {
    const req = {
      method: "GET",
      originalUrl: "/get-user",
    };

    const res = {
      on: sinon.spy(),
    };

    const next = sinon.spy();

    requestLogger(req, res, next);

    expect(logger.info.calledOnce).to.equal(true);
    expect(logger.info.firstCall.args[0]).to.equal("GET /get-user");
    expect(next.calledOnce).to.equal(true);
  });
  it("should log the response status when the request finishes", () => {
    const req = {
      method: "POST",
      originalUrl: "/login",
    };

    let finishCallback;

    const res = {
      statusCode: 200,
      on: (event, callback) => {
        if (event === "finish") {
          finishCallback = callback;
        }
      },
    };

    const next = sinon.spy();

    requestLogger(req, res, next);

    finishCallback();

    expect(logger.info.secondCall.args[0]).to.equal("POST /login 200");
  });
});
describe("Error Handler Middleware", () => {
  let logger;
  let errorHandler;

  beforeEach(() => {
    logger = {
      error: sinon.spy(),
    };

    errorHandler = proxyquire("../middleware/errorHandler", {
      "../logger": logger,
    });
  });

  it("should log the error and return the correct response", () => {
    const err = new Error("Something went wrong");

    const req = {};

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    const next = sinon.spy();

    errorHandler(err, req, res, next);

    expect(logger.error.calledOnce).to.be.true;
    expect(logger.error.firstCall.args[0]).to.equal(err);

    expect(res.status.calledOnceWith(500)).to.be.true;

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.equal({
      error: true,
      message: "Something went wrong",
    });
  });
});
describe("Authenticate Token Middleware", () => {
  let authenticateToken;
  let jwt;

  beforeEach(() => {
    jwt = {
      verify: sinon.stub(),
    };

    authenticateToken = proxyquire("../utilities", {
      jsonwebtoken: jwt,
    }).authenticateToken;
  });

  it("should return 401 when no token is provided", () => {
    const req = {
      headers: {},
    };

    const res = {
      sendStatus: sinon.spy(),
    };

    const next = sinon.spy();

    authenticateToken(req, res, next);

    expect(res.sendStatus.calledOnceWith(401)).to.be.true;
    expect(next.notCalled).to.be.true;
  });
  it("should return 401 when the token is invalid", () => {
    jwt.verify.callsFake((token, secret, callback) => {
      callback(new Error("Invalid token"));
    });

    const req = {
      headers: {
        authorization: "Bearer invalidToken",
      },
    };

    const res = {
      sendStatus: sinon.spy(),
    };

    const next = sinon.spy();

    authenticateToken(req, res, next);

    expect(res.sendStatus.calledOnceWith(401)).to.be.true;
    expect(next.notCalled).to.be.true;
  });
  it("should attach the user to the request and call next() when the token is valid", () => {
    const mockUser = {
      _id: "12345",
      email: "test@example.com",
    };

    jwt.verify.callsFake((token, secret, callback) => {
      callback(null, mockUser);
    });

    const req = {
      headers: {
        authorization: "Bearer validToken",
      },
    };

    const res = {
      sendStatus: sinon.spy(),
    };

    const next = sinon.spy();

    authenticateToken(req, res, next);

    expect(req.user).to.deep.equal(mockUser);
    expect(next.calledOnce).to.be.true;
    expect(res.sendStatus.notCalled).to.be.true;
  });
});
