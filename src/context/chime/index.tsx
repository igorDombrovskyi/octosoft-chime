// import React, {ReactNode, createContext} from 'react';

// import _ from 'lodash';

// import {useInitChime} from './hooks/initChime';
// import {useMeeting} from './hooks/useMeeting';

// import {VideoTilesState} from '../../types/chime';

// type ContextState = {
//   mainVideoTile: VideoTilesState | null;
//   screenShareTile: null | number;
//   currentMuted: boolean;
//   selfVideoEnabled: VideoTilesState | null;
//   isWaitingForAttendee: boolean;
//   attendees: Array<string>;
//   isLoadingInitialization: boolean;
//   clearMeetingData: () => void;
//   handlePressCamera: () => void;
//   handlePressMicro: () => void;
//   initializeMeetingSession: (onInit?: () => void, duration?: number) => void;
//   handleSwitchCamera: () => void;
//   handleExitMeeting: () => void;
//   handleDeleteMeeting: () => void;
//   handleGetTimersData: () => void;
// };

// export const ChimeContext = createContext({
//   mainVideoTile: null,
//   screenShareTile: {},
//   currentMuted: false,
//   selfVideoEnabled: null,
//   isWaitingForAttendee: false,
//   isLoadingInitialization: false,
//   handlePressCamera: _.noop,
//   handlePressMicro: _.noop,
//   initializeMeetingSession: _.noop,
//   handleSwitchCamera: _.noop,
//   handleExitMeeting: _.noop,
//   handleDeleteMeeting: _.noop,
//   clearMeetingData: _.noop,
// } as ContextState);

// export const ContextProvider = ({children}: {children: ReactNode}) => {
//   const {
//     initializeMeetingSession,
//     selfAttendee,
//     handleDeleteMeeting,
//     handleGetTimersData,
//     isLoading,
//   } = useInitChime();

//   const {
//     mainVideoTile,
//     screenShareTile,
//     currentMuted,
//     selfVideoEnabled,
//     isWaitingForAttendee,
//     attendees,
//     handlePressCamera,
//     handlePressMicro,
//     handleSwitchCamera,
//     handleExitMeeting,
//     clearMeetingData,
//   } = useMeeting(selfAttendee);

//   return (
//     <ChimeContext.Provider
//       value={{
//         mainVideoTile,
//         screenShareTile,
//         currentMuted,
//         selfVideoEnabled,
//         isWaitingForAttendee,
//         attendees,
//         isLoadingInitialization: isLoading,
//         handlePressCamera,
//         handlePressMicro,
//         initializeMeetingSession,
//         handleSwitchCamera,
//         handleExitMeeting,
//         clearMeetingData,
//         handleDeleteMeeting,
//         handleGetTimersData,
//       }}
//     >
//       {children}
//     </ChimeContext.Provider>
//   );
// };
