const { expect } = require("chai");
const sinon = require("sinon");
const Note = require("../../models/note.model");
const {
  createNote,
  updateNote,
  getAllNotes,
  deleteNote,
  updatePinnedStatus,
  searchNotes,
} = require("../../services/noteService");

describe("Note Service", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("createNote", () => {
    it("should create a note with the next color", async () => {
      sinon.stub(Note, "countDocuments").resolves(2);
      sinon.stub(Note.prototype, "save").resolves();

      const note = await createNote({
        title: "Test Note",
        content: "Test Content",
        tags: ["test"],
        userId: "user-1",
      });

      expect(note.title).to.equal("Test Note");
      expect(note.content).to.equal("Test Content");
      expect(note.tags).to.deep.equal(["test"]);
      expect(note.userId).to.equal("user-1");
      expect(note.noteColor).to.equal("purple");
      expect(Note.prototype.save.calledOnce).to.equal(true);
    });

    it("should use an empty tags array when tags are not provided", async () => {
      sinon.stub(Note, "countDocuments").resolves(0);
      sinon.stub(Note.prototype, "save").resolves();

      const note = await createNote({
        title: "Test Note",
        content: "Test Content",
        userId: "user-1",
      });

      expect(note.tags).to.deep.equal([]);
      expect(note.noteColor).to.equal("success");
    });
  });

  describe("updateNote", () => {
    it("should return null when the note does not exist", async () => {
      sinon.stub(Note, "findOne").resolves(null);

      const result = await updateNote({
        noteId: "note-1",
        userId: "user-1",
        title: "Updated Note",
      });

      expect(result).to.equal(null);
    });

    it("should update and save the note", async () => {
      const note = {
        title: "Old Title",
        content: "Old Content",
        tags: [],
        isPinned: true,
        save: sinon.stub().resolves(),
      };

      sinon.stub(Note, "findOne").resolves(note);

      const result = await updateNote({
        noteId: "note-1",
        userId: "user-1",
        title: "Updated Title",
        content: "Updated Content",
        tags: ["updated"],
        isPinned: false,
      });

      expect(result.title).to.equal("Updated Title");
      expect(result.content).to.equal("Updated Content");
      expect(result.tags).to.deep.equal(["updated"]);
      expect(result.isPinned).to.equal(false);
      expect(note.save.calledOnce).to.equal(true);
    });
  });

  describe("getAllNotes", () => {
    it("should return notes sorted by pinned status", async () => {
      const notes = [
        { title: "Pinned Note", isPinned: true },
        { title: "Normal Note", isPinned: false },
      ];

      const sortStub = sinon.stub().resolves(notes);
      const findStub = sinon.stub(Note, "find").returns({
        sort: sortStub,
      });

      const result = await getAllNotes("user-1");

      expect(findStub.calledOnceWith({ userId: "user-1" })).to.equal(true);
      expect(sortStub.calledOnceWith({ isPinned: -1 })).to.equal(true);
      expect(result).to.equal(notes);
    });
  });

  describe("deleteNote", () => {
    it("should return false when the note does not exist", async () => {
      sinon.stub(Note, "findOne").resolves(null);

      const result = await deleteNote({
        noteId: "note-1",
        userId: "user-1",
      });

      expect(result).to.equal(false);
    });

    it("should delete the note and return true", async () => {
      sinon.stub(Note, "findOne").resolves({ _id: "note-1" });
      const deleteStub = sinon.stub(Note, "deleteOne").resolves();

      const result = await deleteNote({
        noteId: "note-1",
        userId: "user-1",
      });

      expect(
        deleteStub.calledOnceWith({
          _id: "note-1",
          userId: "user-1",
        }),
      ).to.equal(true);

      expect(result).to.equal(true);
    });
  });

  describe("updatePinnedStatus", () => {
    it("should return null when the note does not exist", async () => {
      sinon.stub(Note, "findOne").resolves(null);

      const result = await updatePinnedStatus({
        noteId: "note-1",
        userId: "user-1",
        isPinned: true,
      });

      expect(result).to.equal(null);
    });

    it("should update the pinned status and save the note", async () => {
      const note = {
        isPinned: false,
        save: sinon.stub().resolves(),
      };

      sinon.stub(Note, "findOne").resolves(note);

      const result = await updatePinnedStatus({
        noteId: "note-1",
        userId: "user-1",
        isPinned: true,
      });

      expect(result.isPinned).to.equal(true);
      expect(note.save.calledOnce).to.equal(true);
    });
  });

  describe("searchNotes", () => {
    it("should search a user's notes by title or content", async () => {
      const notes = [{ title: "University Notes" }];
      const findStub = sinon.stub(Note, "find").resolves(notes);

      const result = await searchNotes({
        userId: "user-1",
        query: "university",
      });

      expect(findStub.calledOnce).to.equal(true);

      const query = findStub.firstCall.args[0];

      expect(query.userId).to.equal("user-1");
      expect(query.$or).to.have.length(2);
      expect(query.$or[0].title.$regex).to.be.instanceOf(RegExp);
      expect(query.$or[1].content.$regex).to.be.instanceOf(RegExp);
      expect(query.$or[0].title.$regex.test("University")).to.equal(true);
      expect(result).to.equal(notes);
    });
  });
});