import React, { useEffect, useRef, useState } from "react";
import * as Chime from "amazon-chime-sdk-js";
import {
  MeetingProvider,
  useMeetingEvent,
} from "amazon-chime-sdk-component-library-react";
import { useSelector } from "react-redux";
import { chimeAxios } from "../../helpers/axios.helper";
import { ReactComponent as Maximize } from "../../utils/icons/maximize-2.svg";
import { ReactComponent as Message } from "../../utils/icons/message.svg";
import { ReactComponent as Mic } from "../../utils/icons/mic.svg";
import { ReactComponent as PhoneCall } from "../../utils/icons/phone-call.svg";
import { ReactComponent as StopCircle } from "../../utils/icons/stop-circle.svg";
import { ReactComponent as Video } from "../../utils/icons/video.svg";
import { ReactComponent as Minimze } from "../../utils/icons/minimize.svg";

import styles from "./index.module.scss";

/*@ts-ignore */
export default function Meeting(props) {
  /*@ts-ignore */
  const { user } = useSelector((state) => state);
  const [meetingResponse, setMeetingResponse] = useState({});
  const [attendeeResponse, setAttendeeResponse] = useState({});
  const [session, setSession] = useState({});
  const [callCreated, setCallCreated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [muteMic, setMuteMic] = useState(false);
  const [stopLocalVideo, setStopLocalVideo] = useState(false);
  const [videoDeviceList, setVideoDeviceList] = useState([]);
  const [audioInputDeviceList, setAudioInputDeviceList] = useState([]);
  const [videoDeviceSelected, setVideoDeviceSelected] = useState();

  const fullVideoTile = useRef();
  const smallVideoTile = useRef();
  const meetingContainer = useRef();

  const [users, setUsers] = useState([
    {
      userId: "d8de9353-6588-4b1e-925e-1fdf88efdf5b",
      // userId: "6731ed58-3cf2-4303-97c4-0c5eb0c1d7c1",
      label: "Doctor",
    },
    {
      userId: "dfd529c7-0717-460d-8aee-e85242c41af1",
      // userId: "1f07b3fe-c2cd-43f1-85d5-3aa04ed93333",
      label: "Patient",
    },
  ]);

  /*@ts-ignore */
  const startMeet = (userId, companionId) => {
    getMeeting(userId, companionId).then((response) => {
      setMeetingResponse(response.Meeting);
      setAttendeeResponse(response.Attendee);
    });
  };

  /*@ts-ignore */
  const changeVidDev = async (label) => {
    console.log(label);
    /*@ts-ignore */
    const list = await session.audioVideo.listVideoInputDevices();
    /*@ts-ignore */
    const dev = list.find((d) => d.label === label);
    /*@ts-ignore */
    await session.audioVideo.stopVideoInput();
    /*@ts-ignore */
    await session.audioVideo.startVideoInput(dev.deviceId);
  };

  useEffect(() => {
    startLocalStream();
  }, []);

  useEffect(() => {
    if (meetingResponse && attendeeResponse) {
      setCallCreated(true);
      joinVideoCall();
    }
  }, [meetingResponse, attendeeResponse]);

  useEffect(() => {
    /*@ts-ignore */
    if (session.audioVideo) {
      stopLocalVideo
        ? /*@ts-ignore */
          session.audioVideo.stopLocalVideoTile()
        : /*@ts-ignore */
          session.audioVideo.startLocalVideoTile();
    }
  }, [stopLocalVideo]);

  useEffect(() => {
    /*@ts-ignore */
    smallVideoTile.current.id = "small-video";
    /*@ts-ignore */
    fullVideoTile.current.id = "full-video";
  }, []);

  useEffect(() => {}, [isExpanded]);

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
      /*@ts-ignore */
      this.switchToFlow("flow-need-permission");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      /*@ts-ignore */
      this.switchToFlow("flow-devices");
      return stream;
    });

    /*@ts-ignore */
    let localTileId = null;
    const smallVideo = document.getElementById("small-video");
    const fullVideo = document.getElementById("full-video");

    const observer = {
      audioVideoDidStart: () => {
        const localTileId = meetingSession.audioVideo.startLocalVideoTile();
        /*@ts-ignore */
        meetingSession.audioVideo.bindVideoElement(localTileId, smallVideo);
      },
      /*@ts-ignore */
      videoTileDidUpdate: (tileState) => {
        if (!tileState.localTile) {
          meetingSession.audioVideo.bindVideoElement(
            tileState.tileId,
            /*@ts-ignore */
            fullVideo
          );
        } else {
          meetingSession.audioVideo.bindVideoElement(
            tileState.tileId,
            /*@ts-ignore */
            smallVideo
          );
          localTileId = tileState.tileId;
        }
      },
      /*@ts-ignore */
      videoTileWasRemoved: (tileId) => {
        /*@ts-ignore */
        if (localTileId === tileId) {
          console.log(
            `You called removeLocalVideoTile. videoElement can be bound to another tile.`
          );
          localTileId = null;
        }
      },
    };

    meetingSession.audioVideo.addObserver(observer);

    const videoDeviceList =
      await meetingSession.audioVideo.listVideoInputDevices(false);
    /*@ts-ignore */
    setVideoDeviceList(videoDeviceList);

    const audioDeviceList =
      await meetingSession.audioVideo.listAudioInputDevices(false);
    /*@ts-ignore */
    setAudioInputDeviceList(audioDeviceList);

    /*@ts-ignore */
    setVideoDeviceSelected(videoDeviceList[0].deviceId);
    console.log("SELECTED VIDEO DEVICE: ", videoDeviceList[0].deviceId);

    let i = 0;
    try {
      await meetingSession.audioVideo.startVideoInput(
        videoDeviceList[i].deviceId
      );
    } catch (error) {
      if (videoDeviceList[i + 1].deviceId) {
        await meetingSession.audioVideo.startVideoInput(
          videoDeviceList[i + 1].deviceId
        );
      }
    }

    try {
      await meetingSession.audioVideo.startAudioInput(
        audioDeviceList[0].deviceId
      );
    } catch (error) {
      await meetingSession.audioVideo.startAudioInput(
        audioDeviceList[1].deviceId
      );
    }

    meetingSession.audioVideo.bindAudioElement(
      /*@ts-ignore */
      document.getElementById("my-audio-element")
    );

    setSession(meetingSession);
    meetingSession.audioVideo.startLocalVideoTile();
    meetingSession.audioVideo.start();
  };

  const stopAudioVideo = async () => {
    /*@ts-ignore */
    await session.audioVideo.stopVideoInput();
    /*@ts-ignore */
    await session.audioVideo.stopAudioInput();
    /*@ts-ignore */
    session.audioVideo.stopVideoPreviewForVideoInput(fullVideoTile.current);

    /*@ts-ignore */
    session.audioVideo.stop();
    return true;
  };

  const muteLocalMic = () => {
    /*@ts-ignore */
    const muted = session.audioVideo.realtimeIsLocalAudioMuted();
    if (muted) {
      console.log("You are muted");
      /*@ts-ignore */
      session.audioVideo.realtimeUnmuteLocalAudio();
    } else {
      console.log("Other attendees can hear your audio");
      /*@ts-ignore */
      session.audioVideo.realtimeMuteLocalAudio();
    }

    setMuteMic(!muteMic);
  };

  return (
    /*@ts-ignore */
    <div className={styles.container} ref={meetingContainer}>
      <div className={styles.controls}>
        <button
          onClick={(e) => {
            e.preventDefault();
            muteLocalMic();
          }}
        >
          {muteMic ? <Mic fill="red" /> : <Mic />}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            setStopLocalVideo(!stopLocalVideo);
          }}
        >
          {stopLocalVideo ? <Video fill="red" /> : <Video />}
        </button>
        <button>
          <StopCircle />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            props.meetingStarted(false);
          }}
        >
          <Message />
        </button>
        <button
          id="stop-call"
          onClick={(e) => {
            e.preventDefault();

            deleteAttendee(
              /*@ts-ignore */
              meetingResponse.MeetingId,
              /*@ts-ignore */
              attendeeResponse.AttendeeId
            ).then(() => {
              console.log("deleted");
            });
            stopAudioVideo().then(() => {
              console.log("stopped");
            });

            setMeetingResponse({});
            stopLocalStream();
            props.meetingStarted(false);
          }}
        >
          <PhoneCall />
        </button>
      </div>
      <div className="meeting-source-container">
        <audio id="my-audio-element"></audio>

        {/*@ts-ignore */}
        <video ref={fullVideoTile}></video>

        <video
          /*@ts-ignore */
          ref={smallVideoTile}
          onClick={(e) => {
            e.preventDefault();
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

/*@ts-ignore */
async function getMeeting(userId, companionId) {
  try {
    const response = await chimeAxios.post("meeting/createMeeting", {
      userId: userId,
      companionId: companionId,
      remainingTime: 900,
    });

    return response.data;
  } catch (error) {
    return error;
  }
}

/*@ts-ignore */
async function deleteAttendee(meetingId, attendeeId) {
  try {
    const response = await chimeAxios.delete("meeting/deleteAttendee", {
      data: {
        meetingId: meetingId,
        attendeeId: attendeeId,
      },
    });

    return response.data;
  } catch (error) {
    return error;
  }
}

function stopLocalStream() {
  /*@ts-ignore */
  window.localStream.getTracks().forEach((track) => {
    track.stop();
  });
}

async function startLocalStream() {
  try {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    /*@ts-ignore */
    window.localStream = stream;
  } catch (error) {
    console.log(error);
  }
}
