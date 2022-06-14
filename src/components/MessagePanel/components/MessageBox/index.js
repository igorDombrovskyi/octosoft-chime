import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { chimeAxios } from "../../../../helpers/axios.helper";
import "./index.css";

export default function MessageBox(props) {
  const channelSelector = useSelector((state) => state.channel);
  const userSelector = useSelector((state) => state.user);
  const fileRef = useRef();

  const [value, setValue] = useState("");
  const [file, setFile] = useState({});

  const handleChange = (value) => {
    setValue(value);
  };

  const sendMessage = (value) => {
    console.log(props.messageToUpdate);
    if (props.messageToUpdate.messageId) {
      props.updateMessage(props.messageToUpdate.messageId, value);
    } else if (props.messageToReply.messageId) {
      props.replyToMessage({ ...props.messageToReply }, value);
    } else {
      props.sendMessage(value);
    }

    setValue("");
  };

  useEffect(() => {
    setValue(props.messageToUpdate.content);
  }, [props.messageToUpdate.messageId]);

  useEffect(() => {
    if (file.fileName) {
      const formData = new FormData();
      formData.append("file", file.file, file.fileName);
      formData.append("channelArn", channelSelector.channelArn);
      formData.append("userId", userSelector.userId);
      formData.append('pendingId', file.fileName + 'kkfo')
      chimeAxios.post("messaging/sendChannelAttachment", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
  }, [file]);

  return (
    <div>
      {props.messageToReply.messageId ? (
        <div className="message-to-reply">
          <span>{userSelector.companion.companionName}:</span>
          <p>{props.messageToReply.content}</p>
        </div>
      ) : (
        ""
      )}

      <div className="message-box-container">
        <img
          src="./assets/paperclip.svg"
          alt="paperclip"
          onClick={(e) => {
            e.preventDefault();
            fileRef.current.click();
          }}
        />
        <input
          type="file"
          ref={fileRef}
          hidden
          onChange={(e) => {
            e.preventDefault();
            setFile({
              file: e.target.files[0],
              fileName: e.target.files[0].name,
            });
          }}
        />
        <div className="input-container">
          <input
            className="input"
            onChange={(e) => {
              e.preventDefault();
              handleChange(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage(value);
              }
            }}
            placeholder="Search"
            value={value}
          />
          <img
            onClick={(e) => {
              e.preventDefault();
              sendMessage(value);
            }}
            className="input-icon"
            src="./assets/navigation.svg"
            alt="send"
          />
        </div>
      </div>
    </div>
  );
}
