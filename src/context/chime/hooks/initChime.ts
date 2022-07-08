// import {useCallback, useEffect, useState} from 'react';
// import {Alert} from 'react-native';

// import {
//   createMiting,
//   deleteMeeting,
//   getMeetingTimersData,
//   getRemainingTime,
// } from '../../../api/chime';

// import {
//   getSDKEventEmitter,
//   MobileSDKEvent,
//   NativeFunction,
// } from '../utils/Bridge';
// import {useAppDispatch, useAppSelector} from '../../../redux/hooks';
// import {CommunicationSlice} from '../../../redux/reducers/chime';

// const {clearMeetingId, setMeetingId, setMeetingTime} =
//   CommunicationSlice.actions;

// export const useInitChime = () => {
//   const dispatch = useAppDispatch();
//   const meetingId = useAppSelector((state) => state.communication.meetingId);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [selfAttendee, setSelfAttendee] = useState<string>('');
//   // const [meetingId, setMeetingId] = useState<string>('');

//   const user = useAppSelector((state) => state.user.user);

//   useEffect(() => {
//     const onMeetingStartSubscription = getSDKEventEmitter().addListener(
//       MobileSDKEvent.OnMeetingStart,
//       () => {
//         setIsLoading(false);
//       },
//     );

//     const onMeetingEndSubscription = getSDKEventEmitter().addListener(
//       MobileSDKEvent.OnMeetingEnd,
//       () => {
//         meetingId && setIsLoading(false);
//       },
//     );
//     const onErrorSubscription = getSDKEventEmitter().addListener(
//       MobileSDKEvent.OnError,
//       (message) => {
//         Alert.alert('SDK Error', message);
//         setIsLoading(false);
//       },
//     );

//     return () => {
//       onMeetingEndSubscription?.remove();
//       onMeetingStartSubscription?.remove();
//       onErrorSubscription?.remove();
//     };
//   }, [meetingId]);

//   const initializeMeetingSession = useCallback(
//     async (onInit: () => void, duration: number) => {
//       try {
//         NativeFunction.stopMeeting();
//         setIsLoading(true);
//         const data = {
//           userId: user?.userInfo?.id,
//           companionId: 'd8de9353-6588-4b1e-925e-1fdf88efdf5b',
//           remainingTime: duration,
//         };

//         const meetingData = await createMiting(data);
//         const remainingTime = await getRemainingTime(
//           meetingData.Meeting.MeetingId,
//         );

//         dispatch(setMeetingTime(remainingTime.data.CurrentTime));

//         setSelfAttendee(meetingData.Attendee.AttendeeId);
//         dispatch(setMeetingId(meetingData.Meeting.MeetingId));

//         NativeFunction.startMeeting(meetingData.Meeting, meetingData.Attendee);

//         onInit?.();
//       } catch (e) {
//         console.log(e);
//       }
//     },
//     [user, meetingId],
//   );

//   const handleDeleteMeeting = useCallback(async () => {
//     try {
//       await deleteMeeting({meetingId});
//       dispatch(clearMeetingId());
//     } catch (e) {
//       console.log(e);
//     }
//   }, [meetingId]);

//   const handleGetTimersData = async () => {
//     const timersResp = await getMeetingTimersData({meetingId});
//     return {
//       consultTime: timersResp?.data?.TotalTime || 0,
//     };
//   };

//   return {
//     initializeMeetingSession,
//     handleDeleteMeeting,
//     handleGetTimersData,
//     selfAttendee,
//     isLoading,
//   };
// };
