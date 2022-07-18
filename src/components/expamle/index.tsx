import {
  MeetingStatus,
  useLocalVideo,
  useMeetingStatus,
  useRemoteVideoTileState,
  useToggleLocalMute,
} from "amazon-chime-sdk-component-library-react";
import _ from "lodash";
import { useContext, useEffect, useRef } from "react";
import { FC, useState } from "react";
import { MeetingContext } from "../../context/chime";
import { ChimeMeeting } from "../Chime/meeting";
import { MessagePanel } from "../MessagePanel";

type ChimeView = {};

export const ChimeView: FC<ChimeView> = () => {
  const { joinVideoCall, handleLeaveMeetingPress, meetingTime } =
    useContext(MeetingContext);
  const { setIsVideoEnabled, isVideoEnabled, toggleVideo } = useLocalVideo();
  const { toggleMute, muted } = useToggleLocalMute();
  const [meetingTimeInSeconds, setMeetingTimeInSeconds] = useState(0);
  const { tiles } = useRemoteVideoTileState();
  const meetingStatus = useMeetingStatus();
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

  const handleJoinVideoCall = () => {
    joinVideoCall({
      companionId: "d8de9353-6588-4b1e-925e-1fdf88efdf5b",
      selfAttendeeId: "dfd529c7-0717-460d-8aee-e85242c41af1",
      remainingTime: 15,
    });
  };

  const toggleLocalVideo = () => {
    toggleVideo();
    setIsVideoEnabled(true);
  };

  const handleMute = () => {
    toggleMute();
  };

  const handleLeaveMeeting = () => {
    handleLeaveMeetingPress();
    clearInterval(interval.current);
  };

  return (
    <div>
      <button onClick={handleJoinVideoCall}>Join Meeting</button>
      <ChimeMeeting
        onLeaveMeetingPress={handleLeaveMeeting}
        toggleLocalVideo={toggleLocalVideo}
        toggleMute={handleMute}
        toggleMaximize={_.noop}
        isMuted={muted}
        meetingTimeInSeconds={meetingTimeInSeconds}
        tiles={tiles}
        isMaximized={false}
        isVideoEnabled={isVideoEnabled}
        onPressMessage={_.noop}
      />
      <MessagePanel
        onMaximizePress={_.noop}
        onPressCall={handleJoinVideoCall}
        user={{
          id: "dfd529c7-0717-460d-8aee-e85242c41af1",
          name: "Maximov",
          surname: "Kirill",
          avatarUrl:
            "https://gravatar.com/avatar/b59e9d2e83e5a2ca278f24d3a91885c7?s=400&d=robohash&r=x",
          online: true,
        }}
        companion={{
          id: "d8de9353-6588-4b1e-925e-1fdf88efdf5b",
          name: "Igor",
          surname: "Dombrovskyu",
          avatarUrl:
            "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
          online: true,
        }}
      />
    </div>
  );
};
