/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { ImageModal } from "../ImageModal";
import moment from "moment";
import "./index.css";
import { ChatMessage } from "../../../../context/types";
import { FC } from "react";
import { useCallback } from "react";

type Message = {
  message: ChatMessage;
  nextSender: boolean;
  avatarUrl: string;
  isIncoming: boolean;
  handleMessageReply: (messageId: string, content: string) => void;
  handleUpdateMessage: (messageId: string, content: string) => void;
  handleDeleteMessage: (messageId: string) => void;
};

export const Message: FC<Message> = ({
  message,
  avatarUrl,
  nextSender,
  isIncoming,
  handleUpdateMessage,
  handleMessageReply,
  handleDeleteMessage,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showToolbox, setShowToolbox] = useState(false);


  const renderMessageContent = useCallback(
    (msg: string, className: string, editedStamp: Date) => {
      let content = msg;
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
        } else {
          return (
            <a href={String(content)} target="_blank" download rel="noreferrer">
              {String(content)}
            </a>
          );
        }
      }
      return editedStamp ? (
        <>
          <span
            className={`edited-tip ${
              className.includes("tip-right") ? "tip-right" : "tip-left"
            }`}
          >
            Edited at {moment(editedStamp).format("HH:MM")}
          </span>
          <p className={className}>{String(content) || ""}</p>
        </>
      ) : (
        <p className={className}>{String(content) || ""}</p>
      );
    },
    []
  );

  const messageUpdate = (messageId: string, content: string) => {
    handleUpdateMessage(messageId, content);
  };

  const toggleToolBox = () => {
    setShowToolbox(!showToolbox);
  };

  if (!isIncoming) {
    return (
      <div className={`message-left-container color-left`}>
        <div className="message-container color">
          {nextSender ? (
            <div
              style={{
                width: "28px",
                marginLeft: "-5px",
              }}
            ></div>
          ) : (
            <img className="avatar-left" src={avatarUrl} alt="user-avatar" />
          )}

          {renderMessageContent(
            message.Content,
            "message-content tip-left",
            message.LastEditedTimestamp
          )}

          <div className="reply-btn">
            <img
              width="15"
              height="15"
              src="./assets/reply.svg"
              alt="reply"
              onClick={(e) => {
                e.preventDefault();
                handleMessageReply(message.MessageId, message.Content);
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
            showToolbox && !message.Content.includes("https")
              ? "show-toolbox"
              : "hide-toolbox"
          }`}
        >
          <img
            src="./assets/delete.svg"
            alt="delete"
            onClick={(e) => {
              e.preventDefault();
              handleDeleteMessage(message.MessageId);
            }}
          />
          <img
            src="./assets/edit.svg"
            alt="edit"
            onClick={(e) => {
              e.preventDefault();
              messageUpdate(message.MessageId, message.Content);
            }}
          />
        </div>
        <div className="message-container">
          {renderMessageContent(
            message.Content,
            "message-content right tip-right",
            message.LastEditedTimestamp
          )}
          {nextSender ? (
            <div
              style={{
                width: "28px",
                marginLeft: "12px",
              }}
            ></div>
          ) : (
            <img className="avatar-right" src={avatarUrl} alt="user-avatar" />
          )}
        </div>
      </div>
    );
  }
};
