import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
// import { CommunicationSlice } from "../../../redux/reducers/chime";
// import { appointmentDetailsSelector } from "../../../redux/selectors/appointments";

// import { TileState, VideoTilesState } from "../../../types/chime";
import {
  createMeetingApi,
  deleteMeeting,
  getMeetingTimersData,
  getRemainingTime,
} from "../../../api/communication";
import {
  ConsoleLogger,
  DefaultEventController,
  LogLevel,
  MeetingSessionConfiguration,
  NoOpEventReporter,
} from "amazon-chime-sdk-js";
import {
  DeviceLabels,
  MeetingStatus,
  useAudioVideo,
  useLocalVideo,
  useMeetingEvent,
  useMeetingManager,
  useMeetingStatus,
} from "amazon-chime-sdk-component-library-react";
import { channelSlice } from "../../../features/channel";
import { useDispatch, useSelector } from "react-redux";

const { setMeetingTime } = channelSlice.actions;

let meetingId = "";

export const useMeeting = (selfAttendeeId: string, companionId: string) => {
  const dispatch = useDispatch();
  //@ts-ignore
  const { meetingTime } = useSelector((state) => state.channel);
  const meetingManager = useMeetingManager();
  const [attendeePresent, setAttendeePresent] = useState(false);
  const [externalVideoTile, setExternalVideoTile] = useState(null);
  const { isVideoEnabled, setIsVideoEnabled } = useLocalVideo();

  const joinVideoCall = async () => {
    const meetingResponse = await createMeetingApi({
      userId: selfAttendeeId,
      companionId: companionId,
      remainingTime: 15,
    });

    meetingId = meetingResponse.Meeting.MeetingId;

    console.log(meetingResponse.Meeting.MeetingId);

    const remainingTime = await getRemainingTime(
      meetingResponse.Meeting.MeetingId
    );

    dispatch(setMeetingTime(remainingTime.data.CurrentTime));

    const meetingSessionConfiguration = new MeetingSessionConfiguration(
      meetingResponse.Meeting,
      meetingResponse.Attendee
    );

    const eventController = new DefaultEventController(
      meetingSessionConfiguration,
      new ConsoleLogger("SDK", LogLevel.OFF)
    );

    const options = {
      deviceLabels: DeviceLabels.AudioAndVideo,
      eventController,
    };

    await meetingManager.join(meetingSessionConfiguration, options);
    await meetingManager.start();

    meetingManager?.meetingSession?.audioVideo.realtimeSubscribeToAttendeeIdPresence(
      (_, present: boolean, externalId = "") => {
        if (!meetingTime && companionId.includes(externalId) && present) {
          setAttendeePresent(true);
          dispatch(setMeetingTime(1));
        }
      }
    );
  };

  const handleGetTimersData = useCallback(async () => {
    const timersResp = await getMeetingTimersData({
      meetingId: meetingId,
    });
    return {
      consultTime: timersResp?.data?.TotalTime || 0,
    };
  }, [meetingManager]);

  const onLeaveMeetingPress = useCallback(async () => {
    const remainingTime = await getRemainingTime(meetingId);
    meetingManager.leave();
    if (!attendeePresent && remainingTime.data.CurrentTime / 60 >= 15) {
      await deleteMeeting({
        meetingId: meetingId,
      });
    }
  }, [attendeePresent, meetingManager, meetingId]);

  return {
    joinVideoCall,
    externalVideoTile,
    onLeaveMeetingPress,
    handleGetTimersData,
  };
};
