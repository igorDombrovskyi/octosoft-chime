import { Reducer } from "react";

export type MeetingState = {
  selfAttendeeId: string;
  companionId: string;
  meetingTime: number | null;
};

export const initialState: MeetingState = {
  selfAttendeeId: "",
  companionId: "",
  meetingTime: null,
};

export enum Actions {
  setParticipantsIds = "setParticipantsIds",
  setMeetingTime = "setMeetingTime",
}

type Action =
  | {
      type: Actions.setParticipantsIds;
      data: { companionId: string; selfAttendeeId: string };
    }
  | {
      type: Actions.setMeetingTime;
      data: { meetingTime: number };
    };

//@ts-ignore
export const meetingReducer: Reducer<MeetingState, Action> = (
  reducerState: MeetingState,
  action: Action
) => {
  switch (action.type) {
    case Actions.setParticipantsIds:
      return {
        ...reducerState,
        selfAttendeeId: action.data.selfAttendeeId,
        companionId: action.data.companionId,
      };
    case Actions.setMeetingTime:
      return {
        ...reducerState,
        meetingTime: action.data.meetingTime,
      };
    default:
      return reducerState;
  }
};
