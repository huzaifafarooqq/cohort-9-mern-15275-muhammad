const logger = require("../logger");
const {
  createNote,
  updateNote,
  getAllNotes,
  deleteNote,
  updatePinnedStatus,
  searchNotes,
} = require("../services/noteService");

const addNote = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    const { user } = req.user;

    if (!title) {
      return res.status(400).json({
        error: true,
        message: "Title is required",
      });
    }

    if (!content) {
      return res.status(400).json({
        error: true,
        message: "Content is required",
      });
    }

    const note = await createNote({
      title,
      content,
      tags,
      userId: user._id,
    });

    logger.info(`Note created by user ${user._id}`);

    return res.json({
      error: false,
      note,
      message: "Note added successfully",
    });
  } catch (error) {
    next(error);
  }
};

const editNote = async (req, res, next) => {
  try {
    const noteId = req.params.noteId;
    const { title, content, tags, isPinned } = req.body;
    const { user } = req.user;

    const hasPinnedChange = typeof isPinned === "boolean";

    if (!title && !content && !tags && !hasPinnedChange) {
      return res.status(400).json({
        error: true,
        message: "No changes provided",
      });
    }

    const note = await updateNote({
      noteId,
      userId: user._id,
      title,
      content,
      tags,
      isPinned,
    });

    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Note not found",
      });
    }

    logger.info(`Note updated: ${noteId}`);

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getNotes = async (req, res, next) => {
  try {
    const { user } = req.user;

    const notes = await getAllNotes(user._id);

    return res.json({
      error: false,
      notes,
      message: "All notes retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

const removeNote = async (req, res, next) => {
  try {
    const noteId = req.params.noteId;
    const { user } = req.user;

    const deleted = await deleteNote({
      noteId,
      userId: user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        error: true,
        message: "Note not found",
      });
    }

    logger.info(`Note deleted: ${noteId}`);

    return res.json({
      error: false,
      message: "Note deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updateNotePinned = async (req, res, next) => {
  try {
    const noteId = req.params.noteId;
    const { isPinned } = req.body;
    const { user } = req.user;

    if (typeof isPinned !== "boolean") {
      return res.status(400).json({
        error: true,
        message: "isPinned must be a boolean",
      });
    }

    const note = await updatePinnedStatus({
      noteId,
      userId: user._id,
      isPinned,
    });

    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Note not found",
      });
    }

    logger.info(`Note ${noteId} ${isPinned ? "pinned" : "unpinned"}`);

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

const searchUserNotes = async (req, res, next) => {
  try {
    const { user } = req.user;
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        error: true,
        message: "Search query is required",
      });
    }

    const matchingNotes = await searchNotes({
      userId: user._id,
      query,
    });

    logger.info(`Search performed: "${query}"`);

    return res.json({
      error: false,
      notes: matchingNotes,
      message: "Notes matching the search query retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addNote,
  editNote,
  getNotes,
  removeNote,
  updateNotePinned,
  searchUserNotes,
};
