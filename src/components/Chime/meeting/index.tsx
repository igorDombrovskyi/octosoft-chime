import {
  LocalVideo,
  RemoteVideo,
} from "amazon-chime-sdk-component-library-react";
import styles from "./styles.module.scss";
//@ts-ignore
import { ReactComponent as Video } from "../../../utils/icons/video.svg";
//@ts-ignore
import { ReactComponent as Minimze } from "../../../utils/icons/minimize.svg";
//@ts-ignore
import { ReactComponent as Maximize } from "../../../utils/icons/maximize.svg";
//@ts-ignore
import { ReactComponent as MessageIcon } from "../../../utils/icons/message.svg";
//@ts-ignore
import { ReactComponent as Mic } from "../../../utils/icons/mic.svg";
//@ts-ignore
import { ReactComponent as PhoneCall } from "../../../utils/icons/phone-call.svg";
import { Button } from "../../button";
import { fmtMSS } from "../../../utils/formatesrs";
import { FC } from "react";

type ChimeMeeting = {
  onLeaveMeetingPress: () => void;
  onPressMessage: () => void;
  toggleMute: () => void;
  toggleLocalVideo: () => void;
  toggleMaximize: () => void;
  containerStyles?: string;
  companionVideoStyles?: string;
  controlsContainerStyles?: string;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isMaximized: boolean;
  meetingTimeInSeconds: number;
  tiles: Array<number>;
};

export const ChimeMeeting: FC<ChimeMeeting> = ({
  toggleMaximize,
  toggleMute,
  onLeaveMeetingPress,
  onPressMessage,
  toggleLocalVideo,
  containerStyles,
  companionVideoStyles,
  controlsContainerStyles,
  meetingTimeInSeconds,
  isMuted,
  isVideoEnabled,
  isMaximized,
  tiles,
}) => {
  return (
    <>
      <div className={`${styles.container}  ${containerStyles}`}>
        <div className={styles.waitingTime}>
          {meetingTimeInSeconds
            ? fmtMSS(meetingTimeInSeconds)
            : "Waiting for attendee..."}
        </div>
        <div className={`${styles.companionVideoView} ${companionVideoStyles}`}>
          <LocalVideo />
        </div>
        {isVideoEnabled && <RemoteVideo tileId={tiles[0]} />}
        <Button onPress={toggleMaximize} containerStyles={styles.expandButton}>
          {isMaximized ? (
            <Maximize color="#fffff" fill="#fff" />
          ) : (
            <Minimze color="#ffffff" fill="#fff" />
          )}
        </Button>
        <div className={`${styles.controls} ${controlsContainerStyles}`}>
          <Button containerStyles={styles.controlsButton} onPress={toggleMute}>
            <Mic fill={isMuted ? "red" : "transparent"} />
          </Button>

          <Button
            containerStyles={styles.controlsButton}
            onPress={toggleLocalVideo}
          >
            <Video fill={isVideoEnabled ? "transparent" : "red"} />
          </Button>

          <Button
            containerStyles={styles.controlsButton}
            onPress={onPressMessage}
          >
            <MessageIcon fill={"transparent"} />
          </Button>
          <Button
            containerStyles={styles.phoneCall}
            onPress={onLeaveMeetingPress}
          >
            <PhoneCall />
          </Button>
        </div>
      </div>
    </>
  );
};
