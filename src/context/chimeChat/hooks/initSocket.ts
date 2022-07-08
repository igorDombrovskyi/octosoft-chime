// import { useCallback, useEffect, useState } from 'react';
// // import {Alert} from 'react-native';
// // import { deleteMeeting } from '../../chime/index';
// // import { useAppSelector } from '../../../redux/hooks';

// export const useInitSocket = () => {
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [selfAttendee, setSelfAttendee] = useState<string>('');
//   const [meetingId, setMeetingId] = useState<string>('');

//   const user = useAppSelector((state) => state.user.user);

//   useEffect(() => { }, []);

//   const createChanelLink = useCallback(() => {

//   }, []);

//   const initializeMeetingSession = useCallback(async () => {
//     try {
//       // setIsLoading(true);
//       // const data =
//       //   user?.userInfo?.email === 'Ihor.dombrovskyi@inmost.pro'
//       //     ? {
//       //       userId: user?.userInfo?.id,
//       //       companionId: 'd8de9353-6588-4b1e-925e-1fdf88efdf5b',
//       //     }
//       //     : {
//       //       userId: user?.userInfo?.id,
//       //       companionId: 'd3e1d9e1-fdd8-446c-9d28-af9d2d7cad9d',
//       //     };

//       // const meetingData = await createMiting(data);

//       // setSelfAttendee(meetingData.Attendee.AttendeeId);
//       // setMeetingId(meetingData.Meeting.MeetingId);
//       // NativeFunction.startMeeting(meetingData.Meeting, meetingData.Attendee);
//     } catch (e) {
//       console.log(e);
//     }
//   }, [user]);

//   const handleDeleteMeeting = useCallback(async () => {
//     try {
//       await deleteMeeting({ meetingId });
//     } catch (e) {
//       console.log(e);
//     }
//   }, [meetingId]);

//   return {
//     initializeMeetingSession,
//     handleDeleteMeeting,
//     selfAttendee,
//     isLoading,
//   };
// };
