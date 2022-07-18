import {
  createContext,
  ReactNode,
  useCallback,
  useReducer,
  useState,
} from "react";
import {
  connectToMeetingApi,
  createMeetingApi,
  deleteMeeting,
  disconnectFromMeetingApi,
  getMeetingTimersData,
  getRemainingTime,
} from "../../api/communication";
import {
  ConsoleLogger,
  DefaultEventController,
  LogLevel,
  MeetingSessionConfiguration,
} from "amazon-chime-sdk-js";
import {
  DeviceLabels,
  useMeetingManager,
} from "amazon-chime-sdk-component-library-react";
import { Actions, initialState, meetingReducer } from "./reducer";
import { InitMeeting } from "../types";
import _ from "lodash";

let meetingId = "";

type MeetingContext = {
  joinVideoCall: (data: InitMeeting) => void;
  handleLeaveMeetingPress: () => void;
  handleGetTimersData: (message: string, messageId: string) => void;
  isLoadingConnection: boolean;
  meetingTime: number | null;
};

export const MeetingContext = createContext({
  joinVideoCall: _.noop,
  handleLeaveMeetingPress: _.noop,
} as MeetingContext);

export const MeetingContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer(meetingReducer, initialState);
  const meetingManager = useMeetingManager();
  const [attendeePresent, setAttendeePresent] = useState(false);

  const joinVideoCall = async ({
    selfAttendeeId,
    companionId,
    remainingTime: remainingMeetingTime,
  }: InitMeeting) => {
    dispatch({
      type: Actions.setParticipantsIds,
      data: { selfAttendeeId, companionId },
    });
    const meetingResponse = await createMeetingApi({
      userId: selfAttendeeId,
      companionId: companionId,
      remainingTime: remainingMeetingTime,
    });

    meetingId = meetingResponse.Meeting.MeetingId;

    const remainingTime = await getRemainingTime(
      meetingResponse.Meeting.MeetingId
    );

    dispatch({
      type: Actions.setMeetingTime,
      data: { meetingTime: remainingTime.data.CurrentTime },
    });
    await connectToMeetingApi(meetingId, selfAttendeeId || "");

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
        if (!state.meetingTime && companionId.includes(externalId) && present) {
          setAttendeePresent(true);
          dispatch({
            type: Actions.setMeetingTime,
            data: { meetingTime: 1 },
          });
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

  const handleLeaveMeetingPress = useCallback(async () => {
    const remainingTime = await getRemainingTime(meetingId);
    meetingManager.leave();
    await disconnectFromMeetingApi(meetingId, state.selfAttendeeId || "");

    if (!attendeePresent && remainingTime.data.CurrentTime / 60 >= 15) {
      await deleteMeeting({
        meetingId: meetingId,
      });
    }
  }, [attendeePresent, meetingManager, meetingId]);

  return (
    <MeetingContext.Provider
      value={{
        joinVideoCall,
        handleLeaveMeetingPress,
        handleGetTimersData,
        isLoadingConnection: true,
        meetingTime: state.meetingTime,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};
