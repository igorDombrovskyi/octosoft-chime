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
  const [videoDeviceList, setVideoDeviceList] = useState([]);
  const [audioInputDeviceList, setAudioInputDeviceList] = useState([]);
  const [audioOutputDeviceList, setAudioOutputDeviceList] = useState([]);
  const [videoDeviceSelected, setVideoDeviceSelected] = useState();
  const [audioInput, setAudioInput] = useState({});
  const [audioOutput, setAudioOutput] = useState({});

  const fullVideoTile = useRef();
  const smallVideoTile = useRef();
  const meetingContainer = useRef();

  const [users, setUsers] = useState([
    {
      userId: "d8de9353-6588-4b1e-925e-1fdf88efdf5b",
      label: "Doctor",
    },
    {
      userId: "dfd529c7-0717-460d-8aee-e85242c41af1",
      label: "Patient",
    },
  ]);

  const startMeet = (userId, companionId) => {
    getMeeting(userId, companionId).then((response) => {
      setMeetingResponse(response.Meeting);
      setAttendeeResponse(response.Attendee);
    });
  };

  const changeVidDev = async (label) => {
    console.log(label);
    const list = await session.audioVideo.listVideoInputDevices();
    const dev = list.find((d) => d.label === label);
    await session.audioVideo.stopVideoInput();
    await session.audioVideo.startVideoInput(dev.deviceId);
  };

  const changeAudioInput = async (label) => {};

  useEffect(() => {
    // window.navigator.permissions
    //   .query({ name: "microphone" })
    //   .then((permissionObj) => {
    //     console.log(permissionObj.state);
    //   })
    //   .catch((error) => {
    //     console.log("Got error :", error);
    //   });
    // window.navigator.permissions
    //   .query({ name: "camera" })
    //   .then((permissionObj) => {
    //     console.log(permissionObj.state);
    //   })
    //   .catch((error) => {
    //     console.log("Got error :", error);
    //   });
  }, []);

  useEffect(() => {
    if (meetingResponse && attendeeResponse) {
      setCallCreated(true);
      joinVideoCall();
    }
  }, [meetingResponse, attendeeResponse]);

  useEffect(() => {
    if (session.audioVideo) {
      stopLocalVideo
        ? session.audioVideo.stopLocalVideoTile()
        : session.audioVideo.startLocalVideoTile();
    }
  }, [stopLocalVideo]);

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

    const messagingSession = new Chime.MessagingSessionConfiguration();

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
      videoTileDidUpdate: (tileState) => {
        // if (!tileState.boundAttendeeId || !tileState.localTile) {
        //   return;
        // }
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

    const videoDeviceList =
      await meetingSession.audioVideo.listVideoInputDevices(false);
    setVideoDeviceList(videoDeviceList);

    const audioDeviceList =
      await meetingSession.audioVideo.listAudioInputDevices(false);
    setAudioInputDeviceList(audioDeviceList);

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
    setAudioInput(audioDeviceList[0].deviceId);

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
      document.getElementById("my-audio-element")
    );

    setSession(meetingSession);
    meetingSession.audioVideo.startLocalVideoTile();
    meetingSession.audioVideo.start();
  };

  const stopAudioVideo = async () => {
    await session.audioVideo.stopVideoInput();
    await session.audioVideo.stopAudioInput();
    session.audioVideo.stopVideoPreviewForVideoInput(fullVideoTile.current);

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
    const muted = session.audioVideo.realtimeIsLocalAudioMuted();
    if (muted) {
      console.log("You are muted");
      session.audioVideo.realtimeUnmuteLocalAudio();
    } else {
      console.log("Other attendees can hear your audio");
      session.audioVideo.realtimeMuteLocalAudio();
    }

    setMuteMic(!muteMic);
  };

  return (
    <div className="meeting-container" ref={meetingContainer}>
      <select
        onChange={(e) => {
          e.preventDefault();
          startMeet(
            users.find((u) => u.userId === e.target.value).userId,
            users.find((u) => u.userId !== e.target.value).userId
          );
        }}
      >
        <option defaultValue>Select user to call</option>
        {users.map((user, i) => {
          return <option value={user.userId}>{user.label}</option>;
        })}
      </select>
      {videoDeviceList ? (
        <select
          disabled
          onChange={(e) => {
            e.preventDefault();
            // setVideoDeviceSelected(e.target.value.deviceId);
            changeVidDev(e.target.value);
          }}
        >
          {videoDeviceList.map((videoDevice, i) => {
            console.log(videoDevice);
            return (
              <option
                defaultValue={
                  videoDeviceSelected === videoDevice.deviceId ? true : false
                }
                value={videoDevice.label}
              >
                {videoDevice.label}
              </option>
            );
          })}
        </select>
      ) : (
        ""
      )}
      {audioInputDeviceList ? (
        <select
          onChange={(e) => {
            e.preventDefault();
            setVideoDeviceSelected(e.target.value);

            session.audioVideo.startAudioInput(e.target.value.deviceId);
          }}
        >
          {audioInputDeviceList.map((audioDevice, i) => {
            console.log(audioDevice);
            return <option value={audioDevice}>{audioDevice.label}</option>;
          })}
        </select>
      ) : (
        ""
      )}

      <div className="control-btns">
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
          <Video fill={stopLocalVideo ? "red" : ""} />
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
            // toggleVideoTile();
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
      remainingTime: 900,
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
