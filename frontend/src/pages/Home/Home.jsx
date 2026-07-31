import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import { MdAdd } from "react-icons/md";
import AddEditNotes from "./AddEditNotes";
import Modal from "react-modal";

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto">
          <div className="grid grid-cols-3 gap-10 mt-10">
            <NoteCard
              title="University Starting on 31st August"
              date="30th July 2026"
              content="University Starting on 31st August. Plan Accordingly!"
              tags="#University"
              isPinned={true}
              bgClass="border-l-primary"
              onEdit={() => {}}
              onDelete={() => {}}
              onPinNote={() => {}}
            />
            <NoteCard
              title="University Starting on 31st August"
              date="30th July 2026"
              content="University Starting on 31st August. Plan Accordingly!"
              tags="#University"
              isPinned={true}
              bgClass="border-l-success"
              onEdit={() => {}}
              onDelete={() => {}}
              onPinNote={() => {}}
            />
            <NoteCard
              title="University Starting on 31st August"
              date="30th July 2026"
              content="University Starting on 31st August. Plan Accordingly!"
              tags="#University"
              isPinned={true}
              bgClass="border-l-info"
              onEdit={() => {}}
              onDelete={() => {}}
              onPinNote={() => {}}
            />
            <NoteCard
              title="University Starting on 31st August"
              date="30th July 2026"
              content="University Starting on 31st August. Plan Accordingly!"
              tags="#University"
              isPinned={true}
              bgClass="border-l-purple"
              onEdit={() => {}}
              onDelete={() => {}}
              onPinNote={() => {}}
            />
            <NoteCard
              title="University Starting on 31st August"
              date="30th July 2026"
              content="University Starting on 31st August. Plan Accordingly!"
              tags="#University"
              isPinned={true}
              bgClass="border-l-peach"
              onEdit={() => {}}
              onDelete={() => {}}
              onPinNote={() => {}}
            />
            <NoteCard
              title="University Starting on 31st August"
              date="30th July 2026"
              content="University Starting on 31st August. Plan Accordingly!"
              tags="#University"
              isPinned={true}
              bgClass="border-l-pink"
              onEdit={() => {}}
              onDelete={() => {}}
              onPinNote={() => {}}
            />
          </div>
        </div>
      </div>
      <button
        className="fixed bottom-8 right-8 w-20 h-20 flex items-center justify-center rounded-full bg-primary hover:bg-primary-dark shadow-2xl hover:scale-110 transition-all duration-300"
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: "add", data: null });
        }}
      >
        <MdAdd className="text-[42px] text-white" />
      </button>
      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel=""
        className="w-[42%] max-h-[85vh] bg-surface rounded-3xl mx-auto mt-10 p-8 shadow-2xl overflow-y-auto"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: null });
          }}
        />
      </Modal>
    </>
  );
};

export default Home;
