import { Message } from "amazon-chime-sdk-js";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  useLocalVideo,
  VideoTileGrid,
  VideoInputControl,
  LocalVideo,
  MeetingProvider,
  RemoteVideo,
  useLocalAudioOutput,
  RemoteVideos,
  useAudioVideo,
  useRemoteVideoTileState,
  useMeetingEvent,
  useLocalAudioInputActivityPreview,
  useToggleLocalMute,
  PreviewVideo,
  useMeetingStatus,
  MeetingStatus,
} from "amazon-chime-sdk-component-library-react";
import styles from "./styles.module.scss";
import { ReactComponent as Video } from "../../../utils/icons/video.svg";
import { ReactComponent as Minimze } from "../../../utils/icons/minimize.svg";
import { ReactComponent as Maximize } from "../../../utils/icons/maximize.svg";
import { ReactComponent as MessageIcon } from "../../../utils/icons/message.svg";
import { ReactComponent as Mic } from "../../../utils/icons/mic.svg";
import { ReactComponent as PhoneCall } from "../../../utils/icons/phone-call.svg";
import { Button } from "../../button";
import { useMeeting } from "../../../context/chime/hooks/useMeeting";
import { fmtMSS } from "../../../utils/formatesrs";

export const ChimeMeeting = () => {
  const { setIsVideoEnabled, isVideoEnabled, toggleVideo } = useLocalVideo();
  const { meetingTime } = useSelector((state) => state["channel"]);
  const { toggleMute, muted } = useToggleLocalMute();
  const [meetingTimeInSeconds, setMeetingTimeInSeconds] = useState(0);
  const [stopLocalVideo, setStopLocalVideo] = useState(false);
  const {
    joinVideoCall,
    externalVideoTile,
    onLeaveMeetingPress,
    handleGetTimersData,
  } = useMeeting(
    "d8de9353-6588-4b1e-925e-1fdf88efdf5b",
    "fd529c7-0717-460d-8aee-e85242c41af1"
  );
  const meetingStatus = useMeetingStatus();
  const { tiles } = useRemoteVideoTileState();
  const interval = useRef();

  useEffect(() => {
    if (!isVideoEnabled && meetingStatus === MeetingStatus.Succeeded) {
      toggleVideo();
    }
  }, [meetingStatus]);

  useEffect(() => {
    if (meetingTime) {
      //@ts-ignore
      interval.current = setInterval(() => {
        setMeetingTimeInSeconds((meetingTimeInSeconds || meetingTime) + 1);
      }, 1000);
    }
    return () => {
      clearInterval(interval.current);
    };
  }, [meetingTime, setMeetingTimeInSeconds, meetingTimeInSeconds]);

  const toggleLocalVideo = () => {
    toggleVideo();
    setIsVideoEnabled(true);
  };

  const handleLeaveMeeting = async () => {
    await handleGetTimersData();

    onLeaveMeetingPress();
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.waitingTime}>
          {meetingTimeInSeconds
            ? fmtMSS(meetingTimeInSeconds)
            : "Waiting for attendee..."}
        </div>
        <div className={styles.companionVideoView}>
          <RemoteVideo tileId={tiles[0]} />
        </div>
        {isVideoEnabled && <LocalVideo />}

        {false ? (
          <Button
            onPress={() => console.log("olollolo")}
            containerStyles={styles.expandButton}
          >
            <Minimze color="#ffffff" fill="#fff" />
          </Button>
        ) : (
          <Button
            onPress={() => console.log("ololololo")}
            containerStyles={styles.expandButton}
          >
            <Maximize color="#fffff" fill="#fff" />
          </Button>
        )}
        <div className={styles.controls}>
          <Button containerStyles={styles.controlsButton} onPress={toggleMute}>
            <Mic fill={muted ? "red" : "transparent"} />
          </Button>

          <Button
            containerStyles={styles.controlsButton}
            onPress={toggleLocalVideo}
          >
            <Video fill={isVideoEnabled ? "transparent" : "red"} />
          </Button>

          <Button
            containerStyles={styles.controlsButton}
            onPress={() => console.log("ololololo")}
          >
            <MessageIcon fill={stopLocalVideo ? "red" : "transparent"} />
          </Button>
          <Button
            containerStyles={styles.phoneCall}
            onPress={handleLeaveMeeting}
          >
            <PhoneCall />
          </Button>
        </div>
      </div>
    </>
  );
};
