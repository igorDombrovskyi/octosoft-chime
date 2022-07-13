import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import styles from "./styles.module.scss";

export default function MessageBox(props) {
  const userSelector = useSelector((state) => state.user);
  const fileRef = useRef();

  const [value, setValue] = useState("");

  const handleChange = (value) => {
    setValue(value);
  };

  const sendMessage = (value) => {
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

  const handleSetFile = (e) => {
    props.onAttachFile(e.target.files[0]);
  };

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

      <div className={styles.messageBoxContainer}>
        <div>
          <img
            src="./assets/paperclip.svg"
            alt="paperclip"
            onClick={(e) => {
              e.preventDefault();
              fileRef.current.click();
            }}
          />
          <input type="file" ref={fileRef} hidden onChange={handleSetFile} />
        </div>

        <div className={styles.inputContainer}>
          <input
            className={styles.input}
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
            className={styles.inputIcon}
            src="./assets/navigation.svg"
            alt="send"
          />
        </div>
      </div>
    </div>
  );
}
