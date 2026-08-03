const request = require("supertest");
const { expect } = require("chai");
const app = require("../index");

describe("Authentication Routes", () => {
  it("should return 400 if fullName is missing", async () => {
    const res = await request(app).post("/create-account").send({
      email: "test@test.com",
      password: "123456",
    });

    expect(res.status).to.equal(400);
    expect(res.body.error).to.equal(true);
    expect(res.body.message).to.equal("Full Name is required");
  });
  it("should return 400 if email is missing", async () => {
    const res = await request(app).post("/create-account").send({
      fullName: "Huzaifa",
      password: "123456",
    });

    expect(res.status).to.equal(400);
    expect(res.body.error).to.equal(true);
    expect(res.body.message).to.equal("Email is required");
  });

  it("should return 400 if password is missing", async () => {
    const res = await request(app).post("/create-account").send({
      fullName: "Huzaifa",
      email: "test@test.com",
    });

    expect(res.status).to.equal(400);
    expect(res.body.error).to.equal(true);
    expect(res.body.message).to.equal("Password is required");
  });
  it("should return 400 if login email is missing", async () => {
    const res = await request(app).post("/login").send({
      password: "123456",
    });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Email is required");
  });

  it("should return 400 if login password is missing", async () => {
    const res = await request(app).post("/login").send({
      email: "test@test.com",
    });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Password is required");
  });
});
