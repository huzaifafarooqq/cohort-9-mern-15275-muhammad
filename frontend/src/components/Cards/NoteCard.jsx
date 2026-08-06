import React from "react";
import moment from "moment";

import { MdOutlinePushPin } from "react-icons/md";
import { MdCreate, MdDelete } from "react-icons/md";

const noteColorStyles = {
  success: {
    border: "border-l-success",
    pin: "text-success",
    pinHover: "hover:text-success",
    badge: "bg-green-100 text-success",
  },
  info: {
    border: "border-l-info",
    pin: "text-info",
    pinHover: "hover:text-info",
    badge: "bg-blue-100 text-info",
  },
  purple: {
    border: "border-l-purple",
    pin: "text-purple",
    pinHover: "hover:text-purple",
    badge: "bg-[#F3E8FF] text-purple",
  },
  peach: {
    border: "border-l-peach",
    pin: "text-peach",
    pinHover: "hover:text-peach",
    badge: "bg-orange-100 text-peach",
  },
  pink: {
    border: "border-l-pink",
    pin: "text-pink",
    pinHover: "hover:text-pink",
    badge: "bg-[#FFE4EE] text-pink",
  },
  primary: {
    border: "border-l-primary",
    pin: "text-primary",
    pinHover: "hover:text-primary",
    badge: "bg-primary-light text-primary-text",
  },
};

const NoteCard = ({
  title,
  date,
  content,
  tags,
  isPinned,
  onEdit,
  onDelete,
  onPinNote,
  bgClass,
  noteColor,
}) => {
  const colorStyle = noteColorStyles[noteColor] || noteColorStyles.primary;
  return (
    <div
      className={`border border-gray-200 border-l-[5px] rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white ${colorStyle.border}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h6 className="text-lg font-semibold text-gray-800">{title}</h6>
          <span className="text-sm text-slate-500">
            {moment(date).format("Do MMM YYYY")}
          </span>
        </div>

        <button type="button" aria-label="Pin note" onClick={onPinNote}>
          <MdOutlinePushPin
            className={`icon-btn ${
              isPinned
                ? colorStyle.pin
                : `text-slate-300 ${colorStyle.pinHover}`
            }`}
          />
        </button>
      </div>

      <div
        className="text-[15px] leading-7 text-gray-600 mt-5"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <div className="flex items-center mt-2">
        {tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((item, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm font-medium ${colorStyle.badge}`}
              >
                #{item}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 ml-auto">
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
