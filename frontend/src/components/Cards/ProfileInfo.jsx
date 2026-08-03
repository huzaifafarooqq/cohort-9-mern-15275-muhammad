import React from "react";
import { getInitials } from "../../utils/helper";

const ProfileInfo = ({ name, onLogout }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 flex items-center justify-center rounded-full text-primary-dark font-semibold bg-primary-light">
        {getInitials(name)}
      </div>

      <div>
        <p className="text-sm font-medium">{name}</p>
        <button
          className="text-[#D89B00] hover:text-primary-dark font-medium transition"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileInfo;
