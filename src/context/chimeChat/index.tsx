// import React, {ReactNode, createContext, useCallback, useState} from 'react';

// import _ from 'lodash';

// import {useSockets} from './hooks/useSocket';

// import {useAppSelector} from '../../redux/hooks';
// import {useDispatch} from 'react-redux';
// import {
//   attachFileMessage,
//   createChannel,
//   deleteMessage,
//   editMessage,
//   getChatMessages,
//   sendMessage,
// } from '../../redux/actions/chime';

// import {IFileObject} from '../../types/files';

// type ContextState = {
//   initChat: (remainingTime: number) => void;
//   handleSendMessage: (message: string, pendingId: string) => void;
//   handleEditMessage: (message: string, messageId: string) => void;
//   handleDeleteMessage: (messageId: string) => void;
//   handleAttachFile: (file: IFileObject | null, pendingId: string) => void;
//   closeConnection: () => void;
//   getMoreMessages: () => void;
//   isLoadingConnection: boolean;
// };

// export const ChatChimeContext = createContext({
//   initChat: _.noop,
// } as ContextState);

// export const ChatChimeContextProvider = ({children}: {children: ReactNode}) => {
//   const {user, chanelArn} = useAppSelector((state) => ({
//     user: state.user.user,
//     chanelArn: state.communication.channel.channelArn,
//   }));
//   const dispatch = useDispatch();

//   const [isLoadingConnection, setIsLoadingConnection] = useState(false);

//   const {connectSocket, closeConnection} = useSockets();

//   const initChat = useCallback(
//     async (remainingTime) => {
//       try {
//         if (user?.userInfo) {
//           const data = {
//             userId: user?.userInfo?.id,
//             companionId: 'd8de9353-6588-4b1e-925e-1fdf88efdf5b',
//             remainingTime: remainingTime,
//           };

//           setIsLoadingConnection(true);
//           const res = await dispatch(createChannel(data));

//           connectSocket(res);
//           setIsLoadingConnection(false);
//           return Promise.resolve('');
//         }
//       } catch (e) {}
//     },
//     [user],
//   );

//   const getMoreMessages = useCallback(() => {
//     const userId = user?.userInfo?.id;
//     dispatch(getChatMessages(userId, true));
//   }, [user]);

//   const handleSendMessage = useCallback(
//     (message, pendingId = '') => {
//       dispatch(
//         sendMessage({
//           userId: user?.userInfo?.id,
//           message: message,
//           channelArn: chanelArn,
//           pendingId,
//         }),
//       );
//     },
//     [user, chanelArn],
//   );

//   const handleEditMessage = useCallback(
//     (message, messageId) => {
//       dispatch(
//         editMessage({
//           userId: user?.userInfo?.id,
//           message: message,
//           channelArn: chanelArn,
//           messageId,
//         }),
//       );
//     },
//     [user, chanelArn],
//   );

//   const handleDeleteMessage = useCallback(
//     (messageId) => {
//       dispatch(
//         deleteMessage({
//           userId: user?.userInfo?.id,
//           channelArn: chanelArn,
//           messageId,
//         }),
//       );
//     },
//     [chanelArn, user],
//   );

//   const handleAttachFile = useCallback(
//     (file, pendingId) => {
//       dispatch(
//         attachFileMessage({userId: user?.userInfo?.id || '', file, pendingId}),
//       );
//     },
//     [user],
//   );

//   return (
//     <ChatChimeContext.Provider
//       value={{
//         initChat,
//         closeConnection,
//         handleSendMessage,
//         handleEditMessage,
//         handleDeleteMessage,
//         handleAttachFile,
//         getMoreMessages,
//         isLoadingConnection,
//       }}
//     >
//       {children}
//     </ChatChimeContext.Provider>
//   );
// };
