const request = require("supertest");
const { expect } = require("chai");
const jwt = require("jsonwebtoken");
const app = require("../../index");

describe("Note Routes", () => {
  let token;

  before(() => {
    token = jwt.sign(
      {
        user: {
          _id: "user-1",
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
    );
  });

  it("should return 401 when no token is provided", async () => {
    const res = await request(app).get("/get-all-notes/");

    expect(res.status).to.equal(401);
  });

  it("should return 400 when note title is missing", async () => {
    const res = await request(app)
      .post("/add-note")
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: "Some content",
      });

    expect(res.status).to.equal(400);
    expect(res.body).to.deep.equal({
      error: true,
      message: "Title is required",
    });
  });

  it("should return 400 when note content is missing", async () => {
    const res = await request(app)
      .post("/add-note")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Note",
      });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Content is required");
  });

  it("should return 400 when no edit changes are provided", async () => {
    const res = await request(app)
      .put("/edit-note/note-1")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("No changes provided");
  });

  it("should return 400 when the search query is missing", async () => {
    const res = await request(app)
      .get("/search-notes/")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(400);
    expect(res.body).to.deep.equal({
      error: true,
      message: "Search query is required",
    });
  });
});