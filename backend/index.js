require("dotenv").config();

const logger = require("./logger");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");

if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      logger.info("Connected to MongoDB");
    })
    .catch((error) => {
      logger.error(error, "MongoDB connection failed");
    });
}

const Note = require("./models/note.model");

const express = require("express");
const cors = require("cors");
const app = express();

const { authenticateToken } = require("./utilities");

const NOTE_COLORS = ["success", "info", "purple", "peach", "pink", "primary"];

app.use(express.json());

app.use(requestLogger);

app.use(
  cors({
    origin: "*",
  }),
);

app.use(authRoutes);

app.get("/", (req, res) => {
  logger.info("Home route accessed");
  res.json({ data: "hello" });
});

app.post("/add-note", authenticateToken, async (req, res, next) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;

  if (!title) {
    return res.status(400).json({ error: true, message: "Title is required" });
  }

  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "Content is required" });
  }

  try {
    const noteCount = await Note.countDocuments({
      userId: user._id,
    });

    const noteColor = NOTE_COLORS[noteCount % NOTE_COLORS.length];

    const note = new Note({
      title,
      content,
      tags: tags || [],
      noteColor,
      userId: user._id,
    });

    await note.save();

    logger.info(`Note created by user ${user._id}`);
    return res.json({
      error: false,
      note,
      message: "Note added successfully",
    });
  } catch (error) {
    next(error);
  }
});

app.put("/edit-note/:noteId", authenticateToken, async (req, res, next) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;

  if (!title && !content && !tags) {
    return res
      .status(400)
      .json({ error: true, message: "No changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    await note.save();

    logger.info(`Note updated: ${noteId}`);
    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    next(error);
  }
});

app.get("/get-all-notes/", authenticateToken, async (req, res, next) => {
  const { user } = req.user;

  try {
    const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });

    return res.json({
      error: false,
      notes,
      message: "All notes retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
});

app.delete(
  "/delete-note/:noteId",
  authenticateToken,
  async (req, res, next) => {
    const noteId = req.params.noteId;
    const { user } = req.user;

    try {
      const note = await Note.findOne({ _id: noteId, userId: user._id });

      if (!note) {
        return res.status(404).json({ error: true, message: "Note not found" });
      }

      await Note.deleteOne({ _id: noteId, userId: user._id });

      logger.info(`Note deleted: ${noteId}`);
      return res.json({
        error: false,
        message: "Note deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

app.put(
  "/update-note-pinned/:noteId",
  authenticateToken,
  async (req, res, next) => {
    const noteId = req.params.noteId;
    const { isPinned } = req.body;
    const { user } = req.user;

    try {
      const note = await Note.findOne({ _id: noteId, userId: user._id });

      if (!note) {
        return res.status(404).json({ error: true, message: "Note not found" });
      }

      note.isPinned = isPinned;

      await note.save();

      logger.info(`Note ${noteId} ${isPinned ? "pinned" : "unpinned"}`);
      return res.json({
        error: false,
        note,
        message: "Note updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

app.get("/search-notes/", authenticateToken, async (req, res, next) => {
  const { user } = req.user;
  const { query } = req.query;

  if (!query) {
    return res
      .status(400)
      .json({ error: true, message: "Search query is required" });
  }

  try {
    const matchingNotes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
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
});

app.use(errorHandler);

const PORT = 8000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

module.exports = app;
