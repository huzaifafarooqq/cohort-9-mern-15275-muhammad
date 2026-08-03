import React from "react";

import { MdOutlinePushPin } from "react-icons/md";
import { MdCreate, MdDelete } from "react-icons/md";

const NoteCard = ({
  title,
  date,
  content,
  tags,
  isPinned,
  onEdit,
  onDelete,
  onPinNote,
  bgClass = "bg-white",
}) => {
  return (
    <div
      className={`border border-gray-200 border-l-[5px] rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white ${bgClass}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h6 className="text-lg font-semibold text-gray-800">{title}</h6>
          <span className="text-sm text-slate-500">{date}</span>
        </div>

        <button type="button" aria-label="Pin note" onClick={onPinNote}>
          <MdOutlinePushPin
            className={`icon-btn ${isPinned ? "text-primary" : "text-slate-300"}`}
          />
        </button>
      </div>

      <p className="text-[15px] leading-7 text-gray-600 mt-5">
        {content?.slice(0, 60)}
      </p>
      <div className="flex items-center justify-between mt-2">
        <div className="px-3 py-1 rounded-full bg-primary-light text-primary-text text-sm font-medium">
          {tags}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" aria-label="Edit note" onClick={onEdit}>
            <MdCreate className="text-2xl text-gray-400 cursor-pointer hover:text-[#4CAF50] transition" />
          </button>

          <button type="button" aria-label="Delete note" onClick={onDelete}>
            <MdDelete className="text-2xl text-gray-400 cursor-pointer hover:text-[#EF4444] transition" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
