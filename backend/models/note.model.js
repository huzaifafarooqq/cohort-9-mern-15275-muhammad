const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const noteSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: { type: [String], default: [] },
  isPinned: { type: Boolean, default: false },
  userId: { type: String, required: true },
  noteColor: {
    type: String,
    enum: NOTE_COLORS,
    default: "primary",
  },
  createdOn: { type: Date, default: Date.now },
});
const NOTE_COLORS = ["success", "info", "purple", "peach", "pink", "primary"];

module.exports = mongoose.model("Note", noteSchema);
