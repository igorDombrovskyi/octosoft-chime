import React, { FC, useEffect, useRef, useState, useContext } from "react";
//@ts-ignore
import { ReactComponent as PhoneCall } from "../../utils/icons/phone-call.svg";
import { Message } from "./components/Message";
import MessageBox from "./components/MessageBox";
import styles from "./styles.module.scss";
import { ChatChimeContext } from "../../context/chimeChat";
import InfiniteScroll from "react-infinite-scroll-component";
import { ClipLoader } from "react-spinners";
import { fmtMSS } from "../../utils/formatesrs";

type ChatParticipant = {
  id: string;
  avatarUrl: string;
  name: string;
  surname: string;
  online: boolean;
};

type MessagePanel = {
  onPressCall: () => void;
  user: ChatParticipant;
  companion: ChatParticipant;
  onMaximizePress: () => void;
};

export const MessagePanel: FC<MessagePanel> = ({
  onPressCall,
  user,
  companion,
}) => {
  //@ts-ignore
  const {
    initChat,
    messages,
    sendMessage,
    handleLoadMore,
    nextToken,
    handleAttachFile,
    handleDeleteMessage,
    handleEditMessage,
    chatTime,
  } = useContext(ChatChimeContext);

  const mainContainer = useRef();
  const phonCall = useRef();
  const [meetingTimeInSeconds, setMeetingTimeInSeconds] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [msgToUpdate, setMsgToUpdate] = useState({
    messageId: "",
    content: "",
  });

  useEffect(() => {
    initChat({
      userId: "dfd529c7-0717-460d-8aee-e85242c41af1",
      companionId: "d8de9353-6588-4b1e-925e-1fdf88efdf5b",
      remainingTime: 15,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const interval = useRef();

  useEffect(() => {
    if (chatTime) {
      interval.current = setInterval(() => {
        setMeetingTimeInSeconds((meetingTimeInSeconds || chatTime) + 1);
      }, 1000);
    }
    return () => {
      clearInterval(interval.current);
    };
  }, [chatTime, setMeetingTimeInSeconds, meetingTimeInSeconds]);

  const handleUpdateMessage = (messageId: string, content: string) => {
    setMsgToUpdate({
      messageId,
      content,
    });
  };

  const handlePhoneCallPress = () => {
    onPressCall?.();
  };

  return (
    //@ts-ignore
    <div className={styles.container} ref={mainContainer}>
      <div className={styles.header}>
        <div className={styles.leftHeaderContainer}>
          <img
            src={isExpanded ? `./assets/minimize.svg` : `./assets/maximize.svg`}
            alt="maximize-logo"
            onClick={(e) => {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }}
          />

          <div className={styles.userInfoContainer}>
            <img
              src={companion.avatarUrl}
              alt="user-avatar"
              className={styles.userAvatar}
            />
            <div className={styles.userInfo}>
              <div>
                {companion.name} {companion.surname}
              </div>
              <div className={styles.userStatus}>
                <div className={styles.statusСircle}></div>
                <span className={styles.statusText}>
                  {companion.online ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
          <div className={styles.waitingTime}>
            {meetingTimeInSeconds
              ? fmtMSS(meetingTimeInSeconds)
              : "Waiting for attendee..."}
          </div>
        </div>
        <div
          className={styles.phoneCall}
          //@ts-ignore
          ref={phonCall}
          onClick={handlePhoneCallPress}
        >
          <PhoneCall />
        </div>
      </div>
      <div className={styles.separator} />

      <div id="scrollableDiv" className={styles.scrollViewContainer}>
        <InfiniteScroll
          className={styles.infinityScrollContainer}
          dataLength={messages.length}
          next={handleLoadMore}
          hasMore={!!nextToken}
          inverse={true}
          loader={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ClipLoader color={"#042793"} loading={true} size={20} />
            </div>
          }
          scrollableTarget="scrollableDiv"
        >
          {messages &&
            !!messages.length &&
            messages.map((message, i) => {
              return (
                <>
                  <Message
                    key={message.MessageId}
                    isIncoming={message.Sender.Name === user.id}
                    avatarUrl={
                      message.Sender.Name === user.id
                        ? user.avatarUrl
                        : companion.avatarUrl
                    }
                    message={message}
                    handleUpdateMessage={handleUpdateMessage}
                    handleDeleteMessage={handleDeleteMessage}
                  />
                </>
              );
            })}
        </InfiniteScroll>
      </div>
      <div>
        <MessageBox
          messageToUpdate={msgToUpdate}
          sendMessage={sendMessage}
          onAttachFile={handleAttachFile}
          updateMessage={handleEditMessage}
        />
      </div>
    </div>
  );
};
