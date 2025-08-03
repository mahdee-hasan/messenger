import React, { useState } from "react";
import { IoAttach, IoSend } from "react-icons/io5";

const SendMessage = ({ id }) => {
  const [inputMessage, setInputMessage] = useState({
    attachment: null,
    text: "",
  });
  const [isAttachment, setIsAttachment] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState([]);

  const handleChangeInput = (e) => {
    try {
      const res = fetch(
        `${import.meta.env.VITE_API_URL}/api/inbox/start-typing/${id}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("error start typing");
      }
    } catch (error) {
      console.log(error.message);
    }

    if (e.target.name === "attachment") {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        setInputMessage({ ...inputMessage, attachment: files });
        setAttachmentFiles((prev) => [...prev, ...files]);
        setIsAttachment(true);
      }
    } else {
      setInputMessage({ ...inputMessage, text: e.target.value });
    }
  };

  const handleSendMessage = async (id) => {
    const data = new FormData();
    if (inputMessage.attachment) {
      inputMessage.attachment.forEach((file) => {
        data.append("attachment", file);
      });
    }
    if (inputMessage.text) {
      data.append("text", inputMessage.text);
    }
    data.append("conversation_id", id);

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/inbox/message`,
      {
        method: "POST",
        body: data,
        credentials: "include",
      }
    );

    setInputMessage({ text: "", attachment: null });
    setAttachmentFiles([]);
    setIsAttachment(false);
  };

  return (
    <form
      className="w-full  rounded border bg-gray-200 py-2 flex items-center"
      encType="multipart/form-data"
      onSubmit={(e) => {
        e.preventDefault();
        handleSendMessage(id);
      }}
    >
      <label htmlFor="attachment">
        <IoAttach className="text-xl text-indigo-900 m-2 font-bold cursor-pointer" />
        <input
          type="file"
          name="attachment"
          id="attachment"
          multiple
          className="hidden"
          onChange={handleChangeInput}
        />
      </label>

      {/* Show selected file names */}
      <div className="flex gap-2">
        {isAttachment &&
          attachmentFiles.map((file, index) => (
            <p
              key={index}
              className="text-xs max-w-12 truncate text-white px-2"
            >
              {file.name}
            </p>
          ))}
      </div>

      <input
        type="text"
        name="text"
        className="flex-1 px-3 py-1 bg-white outline-none rounded-2xl
       text-black "
        placeholder="message"
        value={inputMessage.text}
        onChange={handleChangeInput}
        autoFocus
      />
      {(inputMessage.text || inputMessage.attachment) && (
        <button type="submit" className="p-3 rounded-r-2xl cursor-pointer">
          <IoSend className="text-xl text-indigo-900" />
        </button>
      )}
    </form>
  );
};

export default SendMessage;
