import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ImageModal from "../ImageModal";
import moment from "moment";
import "./index.css";

export default function Message(props) {
  const { channel, user } = useSelector((state) => state);
  const [showModal, setShowModal] = useState(false);
  const [showToolbox, setShowToolbox] = useState(false);
  const [repliedMessage, setRepliedMessage] = useState({
    messageId: "",
    content: "",
  });

  useEffect(() => {
    if (props.message.Content.includes("replyingMessage")) {
      setRepliedMessage(JSON.parse(props.message.Content).replyingMessage);
    }
  }, []);

  const messageContent = (msg, className, editedStamp) => {
    let content = msg;
    if (isJSON(msg)) {
      content = JSON.parse(msg);
      if (content.message && content.message.includes("https")) {
        const splittedUrl = content.message.split("/");
        const contentType = splittedUrl[splittedUrl.length - 1].split(".")[1];
        if (
          contentType.includes("jpg") ||
          contentType.includes("png") ||
          contentType.includes("gif") ||
          contentType.includes("jpeg")
        ) {
          return (
            <>
              <img
                src={content.message}
                onClick={(e) => {
                  e.preventDefault();
                  setShowModal(!showModal);
                }}
                className="image-message"
                alt=""
              />
              <ImageModal
                show={showModal}
                content={content.message}
                name={splittedUrl[splittedUrl.length - 1]}
                handleClose={() => {
                  console.log("Pressed");
                  setShowModal(false);
                }}
              />
            </>
          );
        }
      }
    }
    if (typeof content === "string" && content.includes("https")) {
      const splittedUrl = content.split("/");
      const contentType = splittedUrl[splittedUrl.length - 1].split(".")[1];
      if (
        contentType.includes("jpg") ||
        contentType.includes("png") ||
        contentType.includes("gif") ||
        contentType.includes("jpeg")
      ) {
        return (
          <>
            <img
              src={content}
              onClick={(e) => {
                e.preventDefault();
                setShowModal(!showModal);
              }}
              className="image-message"
              alt=""
            />
            <ImageModal
              show={showModal}
              content={content}
              name={splittedUrl[splittedUrl.length - 1]}
              handleClose={() => {
                console.log("Pressed");
                setShowModal(false);
              }}
            />
          </>
        );
      }
    }
    console.log(content);
    return editedStamp ? (
      <>
        <span
          className={`edited-tip ${
            className.includes("tip-right") ? "tip-right" : "tip-left"
          }`}
        >
          Edited at {moment(editedStamp).format("HH:MM")}
        </span>
        <p className={className}>{content.message || String(content)}</p>
      </>
    ) : (
      <p className={className}>{content.message || String(content)}</p>
    );
  };

  const messageUpdate = (messageId, content) => {
    props.handleUpdateMessage(messageId, content);
  };

  const toggleToolBox = () => {
    setShowToolbox(!showToolbox);
  };

  if (!props.isIncoming) {
    return (
      <div className={`message-left-container color-left`}>
        <div className="message-container color">
          {props.nextSender ? (
            <div
              style={{
                width: "28px",
                marginLeft: "-5px",
              }}
            ></div>
          ) : (
            <img
              className="avatar-left"
              src={props.avatarUrl}
              alt="user-avatar"
            />
          )}

          {messageContent(
            props.message.Content,
            "message-content tip-left",
            props.message.LastEditedTimestamp
          )}

          <div className="reply-btn">
            <img
              width="15"
              height="15"
              src="./assets/reply.svg"
              alt="reply"
              onClick={(e) => {
                e.preventDefault();
                props.handleMessageReply(
                  props.message.MessageId,
                  props.message.Content
                );
              }}
            />
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div
        onClick={(e) => {
          e.preventDefault();
          toggleToolBox();
        }}
        className="message-right-container color-right"
      >
        <div
          className={`message-edit-toolbox ${
            showToolbox && !props.message.Content.includes("https")
              ? "show-toolbox"
              : "hide-toolbox"
          }`}
        >
          <img
            src="./assets/delete.svg"
            alt="delete"
            onClick={(e) => {
              e.preventDefault();
              props.handleDeleteMessage(props.message.MessageId);
            }}
          />
          <img
            src="./assets/edit.svg"
            alt="edit"
            onClick={(e) => {
              e.preventDefault();
              messageUpdate(props.message.MessageId, props.message.Content);
            }}
          />
        </div>
        <div className="message-container">
          {repliedMessage.messageId ? (
            <div className="replied-content">
              <p
                onClick={(e) => {
                  e.preventDefault();
                  props.handleMoveToMessage(repliedMessage.messageId);
                }}
              >
                {repliedMessage.content.replace(/(.{7})..+/, "$1…")}
              </p>
            </div>
          ) : (
            ""
          )}
          {messageContent(
            repliedMessage.messageId
              ? JSON.parse(props.message.Content).content
              : props.message.Content,
            "message-content right tip-right",
            props.message.LastEditedTimestamp
          )}
          {props.nextSender ? (
            <div
              style={{
                width: "28px",
                marginLeft: "12px",
              }}
            ></div>
          ) : (
            <img
              className="avatar-right"
              src={props.avatarUrl}
              alt="user-avatar"
            />
          )}
        </div>
      </div>
    );
  }
}

function isJSON(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
