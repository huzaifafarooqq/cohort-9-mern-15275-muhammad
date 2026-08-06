import React, { useState } from "react";
import ProfileInfo from "../Cards/ProfileInfo";
import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import { Link } from "react-router-dom";

const Navbar = ({ userInfo, onSearchNote, handleClearSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery);
    }
  };

  const handleSearchInputChange = ({ target }) => {
    const value = target.value;

    setSearchQuery(value);

    if (!value.trim()) {
      handleClearSearch();
    }
  };

  const onClearSearch = () => {
    setSearchQuery("");
    handleClearSearch();
  };
  return (
    <div className="bg-surface flex items-center justify-between px-8 py-5 border-b border-gray-200 shadow-sm">
      <Link
        to="/dashboard"
        className="text-3xl font-bold text-secondary tracking-tight"
      >
        Notes
      </Link>
      {onSearchNote && handleClearSearch && (
        <SearchBar
          value={searchQuery}
          onChange={handleSearchInputChange}
          handleSearch={handleSearch}
          onClearSearch={onClearSearch}
        />
      )}
      {userInfo && <ProfileInfo userInfo={userInfo} onLogout={onLogout} />}
    </div>
  );
};

export default Navbar;
