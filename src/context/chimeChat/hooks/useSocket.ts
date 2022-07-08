// import React, {useCallback, useRef} from 'react';

// // import {Alert} from 'react-native';
// import {disconnectFromChatApi, getChatConsultTimeApi} from '../../../api/chime';

// import {useAppDispatch, useAppSelector} from '../../../redux/hooks';
// import {CommunicationSlice} from '../../../redux/reducers/chime';

// const {setNewMessage, updateChanelMessage, deleteMessage, setChatTime} =
//   CommunicationSlice.actions;

// export const useSockets = () => {
//   const dispatch = useAppDispatch();
//   const {chatTimer, userId, chanelArn} = useAppSelector((state) => ({
//     chatTimer: state.communication.chatTime,
//     userId: state.user.user?.userInfo.id,
//     chanelArn: state.communication.channel.channelArn,
//   }));
//   const socket = useRef<WebSocket>();

//   const connectSocket = useCallback(
//     (link) => {
//       if (link) {
//         socket.current = new WebSocket(link);

//         socket.current.onmessage = async (e) => {
//           const message = JSON.parse(e.data).Headers['x-amz-chime-event-type'];
//           const data = JSON.parse(e.data);
//           const payload = JSON.parse(data.Payload);
//           const {ChannelArn, ...parsedMessage} = payload;

//           try {
//             const parsedContent = JSON.parse(parsedMessage.Content);
//             parsedMessage.Content = parsedContent?.message;
//             parsedMessage.pendingId = parsedContent?.pendingId;
//           } catch {}
//           if (message === 'CREATE_CHANNEL_MESSAGE') {
//             if (!chatTimer && parsedMessage.Sender.Name !== userId) {
//               dispatch(setChatTime(1));
//             }
//             dispatch(setNewMessage({message: parsedMessage, ChannelArn}));
//           } else if (message === 'UPDATE_CHANNEL_MESSAGE') {
//             dispatch(updateChanelMessage({message: parsedMessage, ChannelArn}));
//           } else if (message === 'DELETE_CHANNEL_MESSAGE') {
//             dispatch(deleteMessage({message: parsedMessage, ChannelArn}));
//           }
//         };
//         socket.current.onerror = () => {
//           alert('Error: Something went wrong');
//         };
//       }
//     },
//     [chatTimer],
//   );

//   const closeConnection = useCallback(async () => {
//     socket.current?.close();
//     await disconnectFromChatApi({userId: userId, channelArn: chanelArn});
//     const consultTime = await getChatConsultTimeApi({channelArn: chanelArn});
//     return consultTime.TotalTime;
//   }, [userId, chanelArn]);

//   return {
//     connectSocket,
//     closeConnection,
//   };
// };
