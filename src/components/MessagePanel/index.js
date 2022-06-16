import React, { useEffect, useRef, useState } from "react";
import "./index.css";
import { faker } from "@faker-js/faker";
import { chimeAxios } from "../../helpers/axios.helper";
import { useDispatch, useSelector } from "react-redux";
import { setChannelMessages,setNextToken } from "../../features/channel";
import { ReactComponent as PhoneCall } from "../../utils/icons/phone-call.svg";
import Message from "./components/Message";
import MessageBox from "./components/MessageBox";

export default function MessagePanel(props) {
  const userSelector = useSelector((state) => state.user);
  const channelSelector = useSelector((state) => state.channel);
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

  const handleSendMessage = (content) => {
    sendMessage(
      userSelector.userId,
      channelSelector.channelArn,
      content
    ).then();
  };

  const onScroll = (e) => {
    if (e.target.scrollTop) {
      const { scrollTop, scrollHeight, clientHeight, innerHeight } = e.target
      if (Math.round(scrollTop + clientHeight, 10) === Math.round(scrollHeight, 10)) {
        // TO SOMETHING HERE
        console.log('Reached bottom')
        listMessages(userSelector.userId, props.channelArn, channelSelector.nextToken).then((response) => {
         
         dispatch(setNextToken(response.NextToken || null));
         if(response.NextToken) {

          dispatch(setChannelMessages(response.ChannelMessages));
         }
         console.log(channelSelector.nextToken)
        });
        
      }
    }
  };

  const handleMessageReply = (messageId, content) => {
    setMsgToReply({
      messageId,
      content,
    });
  };

  const handleUpdateMessage = (messageId, content) => {
    setMsgToUpdate({
      messageId,
      content,
    });
  };

  const handleMoveToMessage = (messageId) => {
    if (messageRefs.current[messageId]) {
      messageRefs.current[messageId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      let classList = messageRefs.current[messageId].children[0].className;
      messageRefs.current[messageId].children[0].className += ` scrolled`;
      setTimeout(() => {
        messageRefs.current[messageId].children[0].className = classList;
      }, 2000);
    }
  };

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

  useEffect(() => {
    if (isExpanded) {
      mainContainer.current.className = "container expand";
      phonCall.current.className = "phone-call phone-call-move-right";
      setTimeout(() => {
        mainContainer.current.style.width = "1051px";
        mainContainer.current.className = "container";
        phonCall.current.style.marginLeft = "680px";
      }, 1000);
    } else {
      mainContainer.current.className = "container expandOut";
      phonCall.current.className = "phone-call phone-call-move-left";
      setTimeout(() => {
        mainContainer.current.style.width = "501px";
        mainContainer.current.className = "container";
        phonCall.current.style.marginLeft = "109px";
      }, 1000);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (props.channelArn) {
      console.log(props.channelArn);
      listMessages(userSelector.userId, props.channelArn).then((response) => {
        dispatch(setChannelMessages(response.ChannelMessages));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.channelArn]);

  // useEffect(() => {
  //   if(nextToken) {
  //     listMessages(userSelector.userId, props.channelArn, nextToken).then((response) => {
  //       dispatch(setChannelMessages(response.ChannelMessages));
  //       setNextToken(response.NextToken || '')
  //     })
  //   }
  // }, [nextToken])

  useEffect(() => {
    scrollList.current.scrollTop = scrollList.current.scrollHeight;
  }, [channelSelector.channelMessages]);

  return (
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
          ref={phonCall}
          onClick={(e) => {
            e.preventDefault();
            props.meetingStarted(true);
          }}
        >
          <PhoneCall />
        </div>
      </div>
      <div
        style={{
          minWidth: "488px",
          width: "100%",
          height: "0.76px",
          background: "#000",
          opacity: "0.06",
        }}
      ></div>
      <div onScroll={onScroll} className="message-list" ref={scrollList}>
        {channelSelector.channelMessages.length ? (
          channelSelector.channelMessages.map((message, i) => {
            return (
              <>
                <div
                  key={i}
                  ref={(el) => {
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
}

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

async function listMessages(userId, channelArn, nextToken) {
  try {
    const resp = await chimeAxios.get("messaging/listChannelMessages", {
      params: {
        userId: userId,
        channelArn: channelArn,
        nextToken: nextToken || ''
      },
    });

    return resp.data;
  } catch (error) {
    return error;
  }
}
