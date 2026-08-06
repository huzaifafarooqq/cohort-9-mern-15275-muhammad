const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("Note Controller", () => {
  let noteService;
  let logger;
  let controller;

  const makeResponse = () => ({
    status: sinon.stub().returnsThis(),
    json: sinon.spy(),
  });

  beforeEach(() => {
    noteService = {
      createNote: sinon.stub(),
      updateNote: sinon.stub(),
      getAllNotes: sinon.stub(),
      deleteNote: sinon.stub(),
      updatePinnedStatus: sinon.stub(),
      searchNotes: sinon.stub(),
    };

    logger = {
      info: sinon.spy(),
    };

    controller = proxyquire("../../controllers/noteController", {
      "../services/noteService": noteService,
      "../logger": logger,
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("addNote", () => {
    it("returns 400 when title is missing", async () => {
      const req = {
        body: {
          content: "Some content",
        },
        user: {
          user: {
            _id: "user-1",
          },
        },
      };

      const res = makeResponse();
      const next = sinon.spy();

      await controller.addNote(req, res, next);

      expect(res.status.calledOnceWith(400)).to.equal(true);
      expect(res.json.firstCall.args[0].message).to.equal("Title is required");
      expect(noteService.createNote.called).to.equal(false);
    });

    it("creates and returns a note", async () => {
      const note = {
        _id: "note-1",
        title: "Test Note",
      };

      noteService.createNote.resolves(note);

      const req = {
        body: {
          title: "Test Note",
          content: "Some content",
          tags: ["test"],
        },
        user: {
          user: {
            _id: "user-1",
          },
        },
      };

      const res = makeResponse();
      const next = sinon.spy();

      await controller.addNote(req, res, next);

      expect(
        noteService.createNote.calledOnceWith({
          title: "Test Note",
          content: "Some content",
          tags: ["test"],
          userId: "user-1",
        }),
      ).to.equal(true);

      expect(res.json.firstCall.args[0].note).to.equal(note);
      expect(logger.info.calledOnce).to.equal(true);
    });
  });

  describe("editNote", () => {
    it("returns 400 when no changes are provided", async () => {
      const req = {
        params: {
          noteId: "note-1",
        },
        body: {},
        user: {
          user: {
            _id: "user-1",
          },
        },
      };

      const res = makeResponse();
      const next = sinon.spy();

      await controller.editNote(req, res, next);

      expect(res.status.calledOnceWith(400)).to.equal(true);
      expect(res.json.firstCall.args[0].message).to.equal(
        "No changes provided",
      );
    });

    it("returns 404 when the note does not exist", async () => {
      noteService.updateNote.resolves(null);

      const req = {
        params: {
          noteId: "note-1",
        },
        body: {
          title: "Updated title",
        },
        user: {
          user: {
            _id: "user-1",
          },
        },
      };

      const res = makeResponse();
      const next = sinon.spy();

      await controller.editNote(req, res, next);

      expect(res.status.calledOnceWith(404)).to.equal(true);
      expect(res.json.firstCall.args[0].message).to.equal("Note not found");
    });

    it("updates a note", async () => {
      const updatedNote = {
        _id: "note-1",
        title: "Updated title",
        isPinned: false,
      };

      noteService.updateNote.resolves(updatedNote);

      const req = {
        params: {
          noteId: "note-1",
        },
        body: {
          title: "Updated title",
          isPinned: false,
        },
        user: {
          user: {
            _id: "user-1",
          },
        },
      };

      const res = makeResponse();
      const next = sinon.spy();

      await controller.editNote(req, res, next);

      expect(
        noteService.updateNote.calledOnceWith({
          noteId: "note-1",
          userId: "user-1",
          title: "Updated title",
          content: undefined,
          tags: undefined,
          isPinned: false,
        }),
      ).to.equal(true);

      expect(res.json.firstCall.args[0].note).to.equal(updatedNote);
    });
  });

  describe("getNotes", () => {
    it("returns all notes for the current user", async () => {
      const notes = [
        {
          _id: "note-1",
          title: "First note",
        },
        {
          _id: "note-2",
          title: "Second note",
        },
      ];

      noteService.getAllNotes.resolves(notes);

      const req = {
        user: {
          user: {
            _id: "user-1",
          },
        },
      };

      const res = makeResponse();
      const next = sinon.spy();

      await controller.getNotes(req, res, next);

      expect(noteService.getAllNotes.calledOnceWith("user-1")).to.equal(true);
      expect(res.json.firstCall.args[0].notes).to.equal(notes);
    });
  });

  describe("removeNote", () => {
    it("returns 404 when the note cannot be found", async () => {
      noteService.deleteNote.resolves(false);

      const req = {
        params: {
          noteId: "note-1",
        },
        user: {
          user: {
            _id: "user-1",
          },
        },
      };

      const res = makeResponse();
      const next = sinon.spy();

      await controller.removeNote(req, res, next);

      expect(res.status.calledOnceWith(404)).to.equal(true);
      expect(res.json.firstCall.args[0].message).to.equal("Note not found");
    });

    it("deletes a note", async () => {
      noteService.deleteNote.resolves(true);

      const req = {
        params: {
          noteId: "note-1",
        },
        user: {
          user: {
            _id: "user-1",
          },
        },
      };

      const res = makeResponse();
      const next = sinon.spy();

      await controller.removeNote(req, res, next);

      expect(
        noteService.deleteNote.calledOnceWith({
          noteId: "note-1",
          userId: "user-1",
        }),
      ).to.equal(true);

      expect(res.json.firstCall.args[0]).to.deep.equal({
        error: false,
        message: "Note deleted successfully",
      });
    });
  });

  describe("updateNotePinned", () => {
    it("updates the pinned status", async () => {
      const note = {
        _id: "note-1",
        isPinned: true,
      };

      noteService.updatePinnedStatus.resolves(note);

      const req = {
        params: {
          noteId: "note-1",
        },
        body: {
          isPinned: true,
        },
        user: {
          user: {
            _id: "user-1",
          },
        },
      };

      const res = makeResponse();
      const next = sinon.spy();

      await controller.updateNotePinned(req, res, next);

      expect(
        noteService.updatePinnedStatus.calledOnceWith({
          noteId: "note-1",
          userId: "user-1",
          isPinned: true,
        }),
      ).to.equal(true);

      expect(res.json.firstCall.args[0].note).to.equal(note);
    });
  });

  describe("searchUserNotes", () => {
    it("returns 400 when query is missing", async () => {
      const req = {
        query: {},
        user: {
          user: {
            _id: "user-1",
          },
        },
      };

      const res = makeResponse();
      const next = sinon.spy();

      await controller.searchUserNotes(req, res, next);

      expect(res.status.calledOnceWith(400)).to.equal(true);
      expect(res.json.firstCall.args[0].message).to.equal(
        "Search query is required",
      );
    });

    it("returns matching notes", async () => {
      const notes = [
        {
          _id: "note-1",
          title: "University",
        },
      ];

      noteService.searchNotes.resolves(notes);

      const req = {
        query: {
          query: "university",
        },
        user: {
          user: {
            _id: "user-1",
          },
        },
      };

      const res = makeResponse();
      const next = sinon.spy();

      await controller.searchUserNotes(req, res, next);

      expect(
        noteService.searchNotes.calledOnceWith({
          userId: "user-1",
          query: "university",
        }),
      ).to.equal(true);

      expect(res.json.firstCall.args[0].notes).to.equal(notes);
    });
  });

  it("passes service errors to next", async () => {
    const error = new Error("Database error");

    noteService.getAllNotes.rejects(error);

    const req = {
      user: {
        user: {
          _id: "user-1",
        },
      },
    };

    const res = makeResponse();
    const next = sinon.spy();

    await controller.getNotes(req, res, next);

    expect(next.calledOnceWith(error)).to.equal(true);
  });
});