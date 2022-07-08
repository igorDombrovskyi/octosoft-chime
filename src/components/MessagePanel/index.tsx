/*@ts-ignore */
import React, { FC, useEffect, useRef, useState } from "react";
import "./index.css";
import { faker } from "@faker-js/faker";
import { chimeAxios } from "../../helpers/axios.helper";
import { useDispatch, useSelector } from "react-redux";
import { setChannelMessages, setNextToken } from "../../features/channel";
import { ReactComponent as PhoneCall } from "../../utils/icons/phone-call.svg";
import Message from "./components/Message";
import MessageBox from "./components/MessageBox";

type MessagePanel = {
  channelArn: string;
  onPressCall: () => void;
};

export const MessagePanel: FC<MessagePanel> = ({ channelArn, onPressCall }) => {
  /*@ts-ignore */
  const userSelector = useSelector((state) => state.user);
  /*@ts-ignore */
  const channelSelector = useSelector((state) => state.channel);
  console.log(channelSelector);
  const dispatch = useDispatch();

  const scrollList = useRef(null);
  const mainContainer = useRef();
  const messageRefs = useRef([]);
  const phonCall = useRef();
  const listInnerRef = useRef();

  const [isExpanded, setIsExpanded] = useState(false);
  const [msgToUpdate, setMsgToUpdate] = useState({
    messageId: "",
    content: "",
  });
  const [msgToReply, setMsgToReply] = useState({
    messageId: "",
    content: "",
  });
  const [scrolledMessage, setScrolledMessage] = useState({
    scrolled: false,
    className: "scrolled",
  });

  useEffect(() => {}, [isExpanded]);

  useEffect(() => {
    if (channelArn) {
      console.log(channelArn);
      /*@ts-ignore */
      listMessages(userSelector.userId, channelArn).then((response) => {
        dispatch(setChannelMessages(response.ChannelMessages));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelArn]);
  /*@ts-ignore */
  const handleSendMessage = (content) => {
    sendMessage(
      "d8de9353-6588-4b1e-925e-1fdf88efdf5b",
      channelSelector.channelArn,
      content
    ).then();
  };
  /*@ts-ignore */
  const onScroll = (e) => {
    if (e.target.scrollTop) {
      const { scrollTop, scrollHeight, clientHeight, innerHeight } = e.target;
      if (
        /*@ts-ignore */
        Math.round(scrollTop + clientHeight, 10) ===
        /*@ts-ignore */
        Math.round(scrollHeight, 10)
      ) {
        listMessages(
          userSelector.userId,
          channelArn,
          channelSelector.nextToken
        ).then((response) => {
          dispatch(setNextToken(response.NextToken || null));
          if (response.NextToken) {
            dispatch(setChannelMessages(response.ChannelMessages));
          }
        });
      }
    }
  };

  /*@ts-ignore */
  const handleMessageReply = (messageId, content) => {
    setMsgToReply({
      messageId,
      content,
    });
  };

  /*@ts-ignore */
  const handleUpdateMessage = (messageId, content) => {
    setMsgToUpdate({
      messageId,
      content,
    });
  };

  /*@ts-ignore */
  const handleMoveToMessage = (messageId) => {
    if (messageRefs.current[messageId]) {
      /*@ts-ignore */
      messageRefs.current[messageId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      /*@ts-ignore */
      let classList = messageRefs.current[messageId].children[0].className;
      /*@ts-ignore */
      messageRefs.current[messageId].children[0].className += ` scrolled`;
      setTimeout(() => {
        /*@ts-ignore */
        messageRefs.current[messageId].children[0].className = classList;
      }, 2000);
    }
  };

  /*@ts-ignore */
  const replyMessage = (replyingMessage, content) => {
    sendMessage(
      userSelector.userId,
      channelSelector.channelArn,
      JSON.stringify({
        replyingMessage: replyingMessage,
        content: content,
      })
    )
      .then((response) => {
        setMsgToReply({
          messageId: "",
          content: "",
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  /*@ts-ignore */
  const updateMessage = (messageId, content) => {
    chimeAxios
      .put("messaging/updateChannelMessage", {
        userId: userSelector.userId,
        messageId: messageId,
        channelArn: channelSelector.channelArn,
        content: content,
      })
      .then()
      .catch((err) => {
        console.log(err);
      });
  };

  /*@ts-ignore */
  const deleteMessage = (messageId) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Are you sure to deletee this message?")) {
      chimeAxios
        .delete("messaging/deleteChannelMessage", {
          data: {
            userId: userSelector.userId,
            messageId: messageId,
            channelArn: channelSelector.channelArn,
          },
        })
        .then()
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handlePhoneCallPress = () => {
    onPressCall?.();
  };

  // useEffect(() => {
  //   scrollList.current.scrollTop = scrollList.current.scrollHeight;
  // }, [channelSelector.channelMessages]);

  return (
    /*@ts-ignore */
    <div className="container" ref={mainContainer}>
      <div className="header">
        <img
          src={isExpanded ? `./assets/minimize.svg` : `./assets/maximize.svg`}
          alt="maximize-logo"
          onClick={(e) => {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }}
        />

        <div className="user-info-container">
          <img
            src={userSelector.companion.companionAvatar || faker.image.avatar()}
            alt="user-avatar"
            className="user-avatar"
          />
          <div className="user-info">
            <p>
              {userSelector.companion.companionName ||
                `${faker.name.findName()}`}
            </p>
            <div className="user-status">
              <div className="status-circle"></div>
              <span className="status-text">Online</span>
            </div>
          </div>
        </div>
        <div
          className="phone-call"
          /*@ts-ignore */
          ref={phonCall}
          onClick={handlePhoneCallPress}
        >
          <PhoneCall />
        </div>
      </div>
      <div
        style={{
          width: "100%",
        }}
      ></div>
      <div onScroll={onScroll} className="message-list" ref={scrollList}>
        {channelSelector.channelMessages.length ? (
          /*@ts-ignore */
          channelSelector.channelMessages.map((message, i) => {
            return (
              <>
                <div
                  key={i}
                  ref={(el) => {
                    /*@ts-ignore */
                    messageRefs.current[message.MessageId] = el;
                  }}
                  children={
                    <Message
                      key={message.MessageId}
                      nextSender={
                        channelSelector.channelMessages[i + 1]
                          ? channelSelector.channelMessages[i + 1].Sender
                              .Arn === message.Sender.Arn
                          : false
                      }
                      isIncoming={
                        message.Sender.Arn.split("/user/")[1] ===
                        userSelector.userId
                      }
                      avatarUrl={
                        message.Sender.Arn.split("/user/")[1] ===
                        userSelector.userId
                          ? faker.image.avatar()
                          : userSelector.companion.companionAvatar
                      }
                      message={message}
                      userId={userSelector.userId}
                      handleUpdateMessage={handleUpdateMessage}
                      handleDeleteMessage={deleteMessage}
                      handleMessageReply={handleMessageReply}
                      handleMoveToMessage={handleMoveToMessage}
                    />
                  }
                ></div>
              </>
            );
          })
        ) : (
          <></>
        )}
      </div>
      <div>
        <MessageBox
          messageToUpdate={msgToUpdate}
          sendMessage={handleSendMessage}
          updateMessage={updateMessage}
          replyToMessage={replyMessage}
          messageToReply={msgToReply}
        />
      </div>
    </div>
  );
};

/*@ts-ignore */
async function sendMessage(userId, channelArn, content) {
  console.log("Sending");
  try {
    const resp = await chimeAxios.post("messaging/sendChannelMessage", {
      userId: userId,
      channelArn: channelArn,
      content: content,
    });

    return resp.data;
  } catch (error) {
    return error;
  }
}

/*@ts-ignore */
async function listMessages(userId, channelArn, nextToken) {
  try {
    const resp = await chimeAxios.get("messaging/listChannelMessages", {
      params: {
        userId: userId,
        channelArn: channelArn,
        nextToken: nextToken || "",
      },
    });

    return resp.data;
  } catch (error) {
    return error;
  }
}

export default MessagePanel;
