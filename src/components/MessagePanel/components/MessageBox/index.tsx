import { useEffect, useRef, useState } from "react";
import styles from "./styles.module.scss";

export default function MessageBox(props) {
  const fileRef = useRef();

  const [value, setValue] = useState("");

  const handleChange = (value) => {
    setValue(value);
  };

  const sendMessage = (value: string) => {
    if (props?.messageToUpdate?.messageId) {
      props.updateMessage(props.messageToUpdate.messageId, value);
    } else {
      props.sendMessage(value);
    }

    setValue("");
  };

  useEffect(() => {
    setValue(props.messageToUpdate.content);
  }, [props?.messageToUpdate?.messageId]);

  const handleSetFile = (e) => {
    props.onAttachFile(e.target.files[0]);
  };

  const handleSendMessage = (value: string) => {
    sendMessage(value);
  };

  return (
    <div>
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
              console.log(e, value);
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
