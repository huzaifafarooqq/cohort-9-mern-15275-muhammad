const Note = require("../models/note.model");

const NOTE_COLORS = ["success", "info", "purple", "peach", "pink", "primary"];

const createNote = async ({ title, content, tags, userId }) => {
  const noteCount = await Note.countDocuments({ userId });

  const noteColor = NOTE_COLORS[noteCount % NOTE_COLORS.length];

  const note = new Note({
    title,
    content,
    tags: tags || [],
    noteColor,
    userId,
  });

  await note.save();

  return note;
};

const updateNote = async ({
  noteId,
  userId,
  title,
  content,
  tags,
  isPinned,
}) => {
  const note = await Note.findOne({
    _id: noteId,
    userId,
  });

  if (!note) {
    return null;
  }

  if (title) note.title = title;
  if (content) note.content = content;
  if (tags) note.tags = tags;

  if (typeof isPinned === "boolean") {
    note.isPinned = isPinned;
  }

  await note.save();

  return note;
};

const getAllNotes = async (userId) => {
  return Note.find({ userId }).sort({ isPinned: -1 });
};

const deleteNote = async ({ noteId, userId }) => {
  const note = await Note.findOne({
    _id: noteId,
    userId,
  });

  if (!note) {
    return false;
  }

  await Note.deleteOne({
    _id: noteId,
    userId,
  });

  return true;
};

const updatePinnedStatus = async ({ noteId, userId, isPinned }) => {
  const note = await Note.findOne({
    _id: noteId,
    userId,
  });

  if (!note) {
    return null;
  }

  note.isPinned = isPinned;

  await note.save();

  return note;
};

const searchNotes = async ({ userId, query }) => {
  const searchTerm = query.startsWith("#") ? query.slice(1) : query;
  if (searchTerm.length > 100) {
    throw new Error("Search query is too long");
  }

  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const searchRegex = new RegExp(escapedSearchTerm, "i");

  return Note.find({
    userId,
    $or: [
      { title: searchRegex },
      { content: searchRegex },
      { tags: searchRegex },
    ],
  });
};

module.exports = {
  createNote,
  updateNote,
  getAllNotes,
  deleteNote,
  updatePinnedStatus,
  searchNotes,
};
