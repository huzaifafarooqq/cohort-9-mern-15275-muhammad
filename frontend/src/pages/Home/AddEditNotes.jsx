import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TagInput from "../../components/Input/TagInput";
import { MdClose } from "react-icons/md";
import axiosInstance from "../../utils/axiosInstance";

const AddEditNotes = ({
  noteData,
  type,
  getAllNotes,
  onClose,
  showToastMessage,
}) => {
  const [title, setTitle] = useState(noteData?.title || "");
  const [content, setContent] = useState(noteData?.content || "");
  const [tags, setTags] = useState(noteData?.tags || []);

  const [error, setError] = useState(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: noteData?.content || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  const addNewNote = async () => {
    try {
      const response = await axiosInstance.post("/add-note", {
        title,
        content,
        tags,
      });

      if (response.data && response.data.note) {
        showToastMessage("Note Added Successfully", "add");
        getAllNotes();
        onClose();
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Unable to add the note. Please try again.");
      }
    }
  };

  const editNote = async () => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put("/edit-note/" + noteId, {
        title,
        content,
        tags,
      });

      if (response.data && response.data.note) {
        showToastMessage("Note Updated Successfully", "add");
        getAllNotes();
        onClose();
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Unable to update the note. Please try again.");
      }
    }
  };

  const handleAddNote = () => {
    if (!title) {
      setError("Please enter the title");
      return;
    }
    if (!editor || editor.isEmpty) {
      setError("Please enter the content");
      return;
    }
    setError("");

    if (type === "edit") {
      editNote();
    } else {
      addNewNote();
    }
  };
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Close note editor"
        className="w-10 h-10 rounded-full flex items-center justify-center absolute top-3 right-3 bg-gray-100 hover:bg-primary-light transition"
        onClick={onClose}
      >
        <MdClose className="text-xl text-gray-500 hover:text-primary" />
      </button>

      <div className="flex flex-col gap-2">
        <label htmlFor="note-title" className="input-label">
          TITLE
        </label>

        <input
          id="note-title"
          type="text"
          className="text-4xl font-semibold text-gray-800 outline-none placeholder:text-gray-400"
          placeholder="Enter note title"
          value={title}
          onChange={({ target }) => setTitle(target.value)}
        />
      </div>

      <fieldset className="flex flex-col gap-2 mt-4">
        <legend className="input-label">CONTENT</legend>

        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white focus-within:border-primary transition-all">
          <div className="flex flex-wrap items-center gap-2 p-3 border-b border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                editor?.isActive("bold")
                  ? "bg-primary text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <strong>B</strong>
            </button>

            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                editor?.isActive("italic")
                  ? "bg-primary text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <em>I</em>
            </button>

            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                editor?.isActive("bulletList")
                  ? "bg-primary text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              • List
            </button>

            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                editor?.isActive("orderedList")
                  ? "bg-primary text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              1. List
            </button>
          </div>

          <EditorContent
            editor={editor}
            className="min-h-[220px] p-5 text-[15px] text-gray-700 focus:outline-none"
          />
        </div>
      </fieldset>

      <fieldset className="mt-3">
        <legend className="input-label">TAGS</legend>

        <TagInput tags={tags} setTags={setTags} />
      </fieldset>

      {error && (
        <p className="text-red-400 font-medium text-xs pt-4">{error}</p>
      )}

      <button
        className="w-full mt-7 py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
        onClick={handleAddNote}
      >
        {type === "edit" ? "UPDATE" : "ADD"}
      </button>
    </div>
  );
};

export default AddEditNotes;
