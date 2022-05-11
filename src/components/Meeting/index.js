import React, { useEffect, useRef, useState } from "react";
import * as Chime from "amazon-chime-sdk-js";
import { useSelector } from "react-redux";
import { chimeAxios } from "../../helpers/axios.helper";
import { ReactComponent as Maximize } from "../../utils/icons/maximize-2.svg";
import { ReactComponent as Message } from "../../utils/icons/message.svg";
import { ReactComponent as Mic } from "../../utils/icons/mic.svg";
import { ReactComponent as PhoneCall } from "../../utils/icons/phone-call.svg";
import { ReactComponent as StopCircle } from "../../utils/icons/stop-circle.svg";
import { ReactComponent as Video } from "../../utils/icons/video.svg";
import { ReactComponent as Minimze } from "../../utils/icons/minimize.svg";
import faker from "@faker-js/faker";

import "./index.css";

export default function Meeting(props) {
  const { user } = useSelector((state) => state);
  const [meetingResponse, setMeetingResponse] = useState({});
  const [attendeeResponse, setAttendeeResponse] = useState({});
  const [session, setSession] = useState({});
  const [callCreated, setCallCreated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [muteMic, setMuteMic] = useState(false);
  const [stopLocalVideo, setStopLocalVideo] = useState(false);

  const fullVideoTile = useRef();
  const smallVideoTile = useRef();
  const meetingContainer = useRef();

  useEffect(() => {
    if (user.companion.companionId) {
      getMeeting(user.userId, user.companion.companionId).then((response) => {
        setMeetingResponse(response.Meeting);
        setAttendeeResponse(response.Attendee);
      });
    }
  }, [user.companion.companionId]);

  useEffect(() => {
    if (meetingResponse && attendeeResponse) {
      setCallCreated(true);
      joinVideoCall();
    }
  }, [meetingResponse, attendeeResponse]);

  useEffect(() => {
    smallVideoTile.current.id = "small-video";
    fullVideoTile.current.id = "full-video";
  }, []);

  useEffect(() => {
    console.log(isExpanded);
    if (isExpanded) {
      meetingContainer.current.className = "meeting-container expand";
      smallVideoTile.current.className = "tile-move-right";
      setTimeout(() => {
        smallVideoTile.current.className = "tile-right";
        meetingContainer.current.className = "meeting-container-expand";
      }, 1000);
    } else {
      meetingContainer.current.className = "meeting-container expandOut";
      smallVideoTile.current.className = "tile-move-left";
      setTimeout(() => {
        smallVideoTile.current.className = "tile-left";
        meetingContainer.current.className = "meeting-container";
      }, 1000);
    }
  }, [isExpanded]);

  const joinVideoCall = async () => {
    const logger = new Chime.ConsoleLogger(
      "ChimeMeetingLogs",
      Chime.LogLevel.INFO
    );
    const deviceController = new Chime.DefaultDeviceController(logger);

    const configuration = new Chime.MeetingSessionConfiguration(
      { Meeting: meetingResponse },
      { Attendee: attendeeResponse }
    );
    const meetingSession = new Chime.DefaultMeetingSession(
      configuration,
      logger,
      deviceController
    );

    meetingSession.audioVideo.setDeviceLabelTrigger(async () => {
      this.switchToFlow("flow-need-permission");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      this.switchToFlow("flow-devices");
      return stream;
    });

    let localTileId = null;

    const observer = {
      audioVideoDidStart: () => {
        const localTileId = meetingSession.audioVideo.startLocalVideoTile();
        meetingSession.audioVideo.bindVideoElement(
          localTileId,
          fullVideoTile.current
        );
      },
      //   videoTileDidAdd: (tileState) => {
      //     if (tileState.localTile) {
      //       let myVideo = document.getElementById("my-video");

      //       const localTileId = meetingSession.audioVideo.startLocalVideoTile();
      //       meetingSession.audioVideo.bindVideoElement(localTileId, myVideo);
      //     }
      //   },
      videoTileDidUpdate: (tileState) => {
        if (!tileState.boundAttendeeId || !tileState.localTile) {
          return;
        }
        meetingSession.audioVideo.bindVideoElement(
          tileState.tileId,
          smallVideoTile.current
        );
        localTileId = tileState.tileId;
      },
      videoTileWasRemoved: (tileId) => {
        if (localTileId === tileId) {
          console.log(
            `You called removeLocalVideoTile. videoElement can be bound to another tile.`
          );
          localTileId = null;
        }
      },
    };

    meetingSession.audioVideo.addObserver(observer);

    const firstVideoDeviceId = (
      await meetingSession.audioVideo.listVideoInputDevices()
    )[0].deviceId;
    console.log(firstVideoDeviceId);

    await meetingSession.audioVideo.startVideoInput(firstVideoDeviceId);

    const availableAudioInputDevices = (
      await meetingSession.audioVideo.listAudioInputDevices()
    )[0].deviceId;

    await meetingSession.audioVideo.startAudioInput(availableAudioInputDevices);

    meetingSession.audioVideo.bindAudioElement(
      document.getElementById("my-audio-element")
    );

    meetingSession.audioVideo.startLocalVideoTile();
    meetingSession.audioVideo.start();
    setSession(meetingSession);

    if (stopLocalVideo) {
      console.log("LOCAL VIDEO STOPPED?: ", stopLocalVideo);
      meetingSession.audioVideo.stopLocalVideoTile();
    }
  };

  const stopAudioVideo = async () => {
    await session.audioVideo.stopVideoInput();
    await session.audioVideo.stopAudioInput();
    session.audioVideo.stopVideoPreviewForVideoInput(
      document.getElementById("my-video")
    );

    session.audioVideo.stop();
    return true;
  };

  const toggleVideoTile = () => {
    fullVideoTile.current.id =
      fullVideoTile.current.id === "full-video" ? "small-video" : "full-video";
    smallVideoTile.current.id =
      smallVideoTile.current.id === "small-video"
        ? "full-video"
        : "small-video";
  };

  const muteLocalMic = () => {
    setMuteMic(!muteMic);
    muteMic
      ? session.audioVideo.realtimeMuteLocalAudio()
      : session.audioVideo.realtimeUnmuteLocalAudio();
  };

  return (
    <div className="meeting-container" ref={meetingContainer}>
      <div className="control-btns">
        <button
          onClick={(e) => {
            e.preventDefault();
            muteLocalMic();
          }}
        >
          <Mic />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            setStopLocalVideo(!stopLocalVideo);
          }}
        >
          <Video />
        </button>
        <button>
          <StopCircle />
        </button>
        <button onClick={(e) => {
          e.preventDefault();
          props.meetingStarted(false);
        }}>
          <Message />
        </button>
        <button
          id="stop-call"
          onClick={(e) => {
            e.preventDefault();
            deleteMeeting(meetingResponse.MeetingId).then(() => {
              console.log("deleted");
            });
            stopAudioVideo().then(() => {
              console.log("stopped");
            });

            setAttendeeResponse({});
            setMeetingResponse({});
            props.meetingStarted(false);
          }}
        >
          <PhoneCall />
        </button>
      </div>
      <div className="meeting-source-container">
        <audio id="my-audio-element"></audio>

        <video id="my-video" ref={fullVideoTile}></video>

        <video
          ref={smallVideoTile}
          id="remote-attendee-video"
          onClick={(e) => {
            e.preventDefault();
            toggleVideoTile();
          }}
        ></video>
        <div
          id="expand-btn"
          onClick={(e) => {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? <Minimze /> : <Maximize />}
        </div>
      </div>
    </div>
  );
}

async function getMeeting(userId, companionId) {
  try {
    const response = await chimeAxios.post("meeting/createMeeting", {
      userId: userId,
      companionId: companionId,
    });

    return response.data;
  } catch (error) {
    return error;
  }
}

async function deleteMeeting(meetingId) {
  try {
    const response = await chimeAxios.delete("meeting/deleteMeeting", {
      data: {
        meetingId: meetingId,
      },
    });

    return response.data;
  } catch (error) {
    return error;
  }
}
