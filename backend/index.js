require("dotenv").config();

const logger = require("./logger");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info("Connected to MongoDB");
  })
  .catch((error) => {
    logger.error(error, "MongoDB connection failed");
  });

const User = require("./models/user.model");
const Note = require("./models/note.model");

const express = require("express");
const cors = require("cors");
const app = express();

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

const NOTE_COLORS = ["success", "info", "purple", "peach", "pink", "primary"];

app.use(express.json());

app.use(requestLogger);

app.use(
  cors({
    origin: "*",
  }),
);

app.get("/", (req, res) => {
  logger.info("Home route accessed");
  res.json({ data: "hello" });
});

app.post("/create-account", async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName) {
      return res
        .status(400)
        .json({ error: true, message: "Full Name is required" });
    }

    if (!email) {
      return res
        .status(400)
        .json({ error: true, message: "Email is required" });
    }

    if (!password) {
      return res
        .status(400)
        .json({ error: true, message: "Password is required" });
    }

    const isUser = await User.findOne({ email: email });

    if (isUser) {
      return res.json({
        error: true,
        message: "User already exist",
      });
    }

    const user = new User({
      fullName,
      email,
      password,
    });

    await user.save();

    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "36000m",
    });

    logger.info(`New user registered: ${email}`);
    return res.json({
      error: false,
      user,
      accessToken,
      message: "Registration Successful",
    });
  } catch (error) {
    next(error);
  }
});

app.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const userInfo = await User.findOne({ email: email });

    if (!userInfo) {
      return res.status(400).json({ message: "User not found" });
    }

    if (userInfo.email == email && userInfo.password == password) {
      const user = { user: userInfo };
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "36000m",
      });

      logger.info(`User logged in: ${email}`);
      return res.json({
        error: false,
        message: "Login Successful",
        email,
        accessToken,
      });
    } else {
      return res.status(400).json({
        error: true,
        message: "Invalid Credentials",
      });
    }
  } catch (error) {
    next(error);
  }
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

app.get("/get-user", authenticateToken, async (req, res, next) => {
  try {
    const { user } = req.user;

    const isUser = await User.findOne({ _id: user._id });

    if (!isUser) {
      return res.sendStatus(401);
    }

    return res.json({
      user: {
        fullName: isUser.fullName,
        email: isUser.email,
        _id: isUser._id,
        createdOn: isUser.createdOn,
      },
      message: "",
    });
  } catch (error) {
    next(error);
  }
});

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
