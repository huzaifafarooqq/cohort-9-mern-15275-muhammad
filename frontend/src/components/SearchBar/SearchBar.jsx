import React from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";

const SearchBar = ({ value, onChange, handleSearch, onClearSearch }) => {
  return (
    <div className="w-[520px] h-14 flex items-center px-6 bg-surface border border-primary-light rounded-2xl shadow-sm transition-all duration-300 focus-within:ring-4 focus-within:ring-primary/20">
      <input
        type="text"
        placeholder="Search Notes"
        className="w-full text-[15px] bg-transparent outline-none placeholder:text-gray-400"
        value={value}
        onChange={onChange}
      />

      {value && (
        <IoMdClose
          className="text-xl text-slate-500 cursor-pointer hover:text-black mr-3"
          onClick={onClearSearch}
        />
      )}

      <FaMagnifyingGlass
        className="text-xl text-[#D89B00] cursor-pointer hover:text-primary-text"
        onClick={handleSearch}
      />
    </div>
  );
};

export default SearchBar;
