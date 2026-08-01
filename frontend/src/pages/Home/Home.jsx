import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import { MdAdd } from "react-icons/md";
import AddEditNotes from "./AddEditNotes";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import axiosInstance from "../../utils/axiosInstance";
<<<<<<< HEAD
import Toast from "../../components/ToastMessage/Toast";
=======
>>>>>>> 3fb2f33 (feat: integrate authentication APIs with frontend)

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

<<<<<<< HEAD
  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: "",
    type: "add",
  });

  const [allNotes, setAllNotes] = useState([]);
=======
>>>>>>> 3fb2f33 (feat: integrate authentication APIs with frontend)
  const [userInfo, setUserInfo] = useState(null);

  const navigate = useNavigate();

<<<<<<< HEAD
  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  const showToastMessage = (message, type) => {
    setShowToastMsg({
      isShown: true,
      message,
      type,
    });
  };

  const handleCloseToast = () => {
    setShowToastMsg({
      isShown: false,
      message: "",
    });
  };

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");

      if (response.data?.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      showToastMessage("Failed to load user information", "delete");
    }
  };

  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");

      if (response.data?.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      showToastMessage("Failed to load notes", "delete");
=======
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
>>>>>>> 3fb2f33 (feat: integrate authentication APIs with frontend)
    }
  };

  useEffect(() => {
<<<<<<< HEAD
    getAllNotes();
=======
>>>>>>> 3fb2f33 (feat: integrate authentication APIs with frontend)
    getUserInfo();
    return () => {};
  }, []);

  const handleCloseModal = () => {
    setOpenAddEditModal({
      isShown: false,
      type: "add",
      data: null,
    });
  };

  return (
    <>
<<<<<<< HEAD
      <Navbar userInfo={userInfo} />
=======
      <Navbar userInfo={userInfo}/>
>>>>>>> 3fb2f33 (feat: integrate authentication APIs with frontend)
      <div className="min-h-screen bg-background">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-10">
            {allNotes.map((item, index) => (
              <NoteCard
                key={item._id}
                title={item.title}
                date={item.createdOn}
                content={item.content}
                tags={item.tags}
                isPinned={item.isPinned}
                noteColor={item.noteColor}
                onEdit={() => handleEdit(item)}
                onDelete={() => {}}
                onPinNote={() => {}}
              />
            ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-label="Add note"
        className="fixed bottom-8 right-8 w-20 h-20 flex items-center justify-center rounded-full bg-primary hover:bg-primary-dark shadow-2xl hover:scale-110 transition-all duration-300"
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: "add", data: null });
        }}
      >
        <MdAdd className="text-[42px] text-white" />
      </button>
      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={handleCloseModal}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel={
          openAddEditModal.type === "edit" ? "Edit note" : "Add note"
        }
        className="w-[95%] sm:w-[85%] md:w-[70%] lg:w-[42%] max-h-[85vh] bg-surface rounded-3xl mx-auto mt-10 p-8 shadow-2xl overflow-y-auto"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: null });
          }}
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage}
        />
      </Modal>

      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default Home;
