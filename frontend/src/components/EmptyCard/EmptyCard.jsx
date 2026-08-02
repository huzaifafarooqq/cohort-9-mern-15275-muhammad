import React from "react";

const EmptyCard = ({ imgSrc, message }) => {
  return (
    <div className="flex flex-col items-center justify-center mt-8 px-6">
      <img
        src={imgSrc}
        alt="No notes"
        className="w-80 h-80 object-contain"
      />

      <p className="max-w-2xl text-lg text-gray-600 text-center leading-8 mt-6">
        {message}
      </p>
    </div>
  );
};

export default EmptyCard;