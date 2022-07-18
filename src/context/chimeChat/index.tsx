import { ReactNode, createContext, useCallback, useState, useRef } from "react";
import _ from "lodash";
import { ChatMessage, IInitChat } from "../types";
import {
  attachFileMessageAPI,
  connectToChatApi,
  createChatChanelAPI,
  deleteMessageAPI,
  disconnectFromChatApi,
  editMessageAPI,
  getChatConsultTimeApi,
  getChatMessagesAPI,
  getConnectionLinkAPI,
  sendMessageAPI,
} from "../../api/communication";
import cuid from "cuid";
import { useReducer } from "react";
import { Actions, chatReducer, initialState } from "./reducer";

type ContextState = {
  initChat: (data: IInitChat) => void;
  handleSendMessage: (data: { message: string; pendingId: string }) => void;
  handleEditMessage: (message: string, messageId: string) => void;
  handleDeleteMessage: (messageId: string) => void;
  handleAttachFile: (file: null, pendingId: string) => void;
  closeConnection: () => void;
  messages: Array<ChatMessage>;
  sendMessage: (value: string) => void;
  handleLoadMore: () => void;
  nextToken: string;
  isLoadingConnection: boolean;
  chatTime: number | string;
};

let userId = "";

export const ChatChimeContext = createContext({
  initChat: _.noop,
} as ContextState);

export const ChatContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [isLoadingConnection, setIsLoadingConnection] = useState(false);

  const initChat = useCallback(
    async (initData: IInitChat) => {
      dispatch({ type: Actions.setInitData, data: initData });
      userId = initData.userId;
      const data = {
        userId: initData.userId,
        companionId: initData.companionId,
      };
      try {
        //@ts-ignore
        const resp = await createChatChanelAPI(data);

        const linkResp = await getConnectionLinkAPI({
          userId: initData.userId,
        });

        await connectToChatApi({
          userId: initData.userId,
          channelArn: resp.ChannelArn,
          remainingTime: initData.remainingTime,
        });

        const chatMessagesResp = await getChatMessagesAPI({
          userId: initData.userId,
          channelId: resp.ChannelArn,
        });

        dispatch({
          type: Actions.setChatTime,
          data: chatMessagesResp.CurrentTime,
        });
        dispatch({
          type: Actions.setConenctionLink,
          data: linkResp.ConnectLink,
        });
        dispatch({ type: Actions.setChannelArn, data: resp.ChannelArn });
        dispatch({
          type: Actions.setNextToken,
          data: chatMessagesResp.NextToken,
        });
        dispatch({
          type: Actions.setChatMessages,
          data: chatMessagesResp.ChannelMessages,
        });
        dispatch({
          type: Actions.setChatMessages,
          data: chatMessagesResp.ChannelMessages,
        });

        connectSocket(linkResp.ConnectLink);
      } catch (e) {}
    },
    [state]
  );

  const socket = useRef<WebSocket>();

  const connectSocket = (link: string) => {
    if (link) {
      socket.current = new WebSocket(link);

      socket.current.onmessage = async (e) => {
        const message = JSON.parse(e.data).Headers["x-amz-chime-event-type"];
        const data = JSON.parse(e.data);
        const payload = JSON.parse(data.Payload);
        const { ChannelArn, ...parsedMessage } = payload;
        try {
          const parsedContent = JSON.parse(parsedMessage.Content);
          parsedMessage.Content = parsedContent?.message;
          parsedMessage.pendingId = parsedContent?.pendingId;
        } catch {}
        if (message === "CREATE_CHANNEL_MESSAGE") {
          if (!state.chatTime && parsedMessage.Sender.Name !== userId) {
            //@ts-ignore
            dispatch({ type: Actions.setChatTime, data: 1 });
          }
          dispatch({
            type: Actions.setNewMessage,
            data: { message: parsedMessage, ChannelArn },
          });
        } else if (message === "UPDATE_CHANNEL_MESSAGE") {
          dispatch({
            type: Actions.updateMessage,
            data: { message: parsedMessage, ChannelArn },
          });
        } else if (message === "DELETE_CHANNEL_MESSAGE") {
          dispatch({
            type: Actions.deleteMessage,
            data: { message: parsedMessage, ChannelArn },
          });
        }
      };
      socket.current.onerror = () => {
        // Alert.alert("Error", "Something went wrong");
      };
    }
  };

  const handleLoadMore = async () => {
    const chatMessagesResp = await getChatMessagesAPI({
      userId: state.initData.userId,
      channelId: state.channelArn,
      nextToken: state.nextToken,
    });

    dispatch({ type: Actions.setNextToken, data: chatMessagesResp.NextToken });
    dispatch({
      type: Actions.setMoreMessages,
      data: chatMessagesResp.ChannelMessages,
    });
  };

  const closeConnection = async () => {
    socket.current?.close();
    await disconnectFromChatApi({
      userId: state.initData.userId,
      channelArn: state.channelArn,
    });
    const consultTime = await getChatConsultTimeApi({
      channelArn: state.channelArn,
    });
    return consultTime.TotalTime;
  };

  const handleSendMessage = async ({ message = "", pendingId = "" }) => {
    dispatch({
      type: Actions.setNewMessage,
      data: {
        message: {
          Content: message,
          pendingId,
          Sender: { Name: state.initData.userId },
        },
        ChannelArn: state.channelArn,
      },
    });

    await sendMessageAPI({
      userId: state.initData.userId,
      chanelId: state.channelArn,
      message: JSON.stringify({ message: message, pendingId }),
    });
  };

  const handleEditMessage = async (messageId: string, message: string) => {
    await editMessageAPI({
      message,
      userId: state.initData.userId,
      chanelId: state.channelArn,
      messageId,
    });
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessageAPI({
      userId: state.initData.userId,
      chanelId: state.channelArn,
      messageId,
    });
  };

  const handleAttachFile = async (file: any) => {
    const pendingId = cuid();
    dispatch({
      type: Actions.setNewMessage,
      data: {
        message: {
          Content: JSON.stringify(file),
          pendingId,
          Sender: { Name: state.initData.userId },
        },
        ChannelArn: state.channelArn,
      },
    });
    await attachFileMessageAPI({
      userId: state.initData.userId,
      channelArn: state.channelArn,
      file,
      pendingId: pendingId,
    });
  };

  const sendMessage = (message: string) => {
    handleSendMessage({
      message,
      pendingId: cuid(),
    });
  };

  return (
    <ChatChimeContext.Provider
      value={{
        initChat,
        closeConnection,
        handleSendMessage,
        handleLoadMore,
        handleEditMessage,
        handleDeleteMessage,
        handleAttachFile,
        sendMessage,
        isLoadingConnection,
        nextToken: state.nextToken,
        messages: state.messages,
        chatTime: state.chatTime,
      }}
    >
      {children}
    </ChatChimeContext.Provider>
  );
};
