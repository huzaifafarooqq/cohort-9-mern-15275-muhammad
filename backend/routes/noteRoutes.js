const express = require("express");
const { authenticateToken } = require("../utilities");
const {
  addNote,
  editNote,
  getNotes,
  removeNote,
  updateNotePinned,
  searchUserNotes,
} = require("../controllers/noteController");

const router = express.Router();

router.post("/add-note", authenticateToken, addNote);
router.put("/edit-note/:noteId", authenticateToken, editNote);
router.get("/get-all-notes/", authenticateToken, getNotes);
router.delete("/delete-note/:noteId", authenticateToken, removeNote);
router.put("/update-note-pinned/:noteId", authenticateToken, updateNotePinned);
router.get("/search-notes/", authenticateToken, searchUserNotes);

module.exports = router;