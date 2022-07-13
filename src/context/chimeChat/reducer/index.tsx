import { Reducer } from "react";
import { ChatMessage, IInitChat } from "../../types";

export type ChatState = {
  connectionLink: string;
  channelArn: string;
  chatTime: string;
  nextToken: string;
  initData: IInitChat;
  messages: Array<ChatMessage>;
};

export const initialState: ChatState = {
  connectionLink: "",
  channelArn: "",
  chatTime: "",
  nextToken: "",
  messages: [],
  initData: {
    userId: "",
    remainingTime: "",
    companionId: "",
  },
};

interface TransformMessage {
  message: any;
  ChannelArn: string;
}

export enum Actions {
  setConenctionLink = "setConenctionLink",
  setChannelArn = "setChannelArn",
  setChatTime = "setChatTime",
  setNextToken = "setNextToken",
  setInitData = "setInitData",
  setChatMessages = "setChatMessages",
  setMoreMessages = "setMoreMessages",
  setNewMessage = "setNewMessage",
  deleteMessage = "deleteMessage",
  updateMessage = "updateMessage",
}

type Action =
  | { type: Actions.setConenctionLink; data: "" }
  | { type: Actions.setChannelArn; data: "" }
  | { type: Actions.setChatTime; data: "" }
  | { type: Actions.setNextToken; data: "" }
  | { type: Actions.setInitData; data: IInitChat }
  | { type: Actions.setChatMessages; data: TransformMessage }
  | { type: Actions.setMoreMessages; data: Array<ChatMessage> }
  | { type: Actions.setNewMessage; data: TransformMessage }
  | { type: Actions.deleteMessage; data: TransformMessage }
  | { type: Actions.updateMessage; data: TransformMessage };

//@ts-ignore
export const chatReducer: Reducer<ChatState, Action> = (
  reducerState: ChatState,
  action: Action
) => {
  switch (action.type) {
    case "setConenctionLink":
      return {
        ...reducerState,
        connectionLink: action.data,
      };
    case "setChannelArn":
      return {
        ...reducerState,
        channelArn: action.data,
      };
    case "setChatTime":
      return {
        ...reducerState,
        chatTime: action.data,
      };
    case "setNextToken":
      return {
        ...reducerState,
        nextToken: action.data,
      };
    case "setInitData":
      return {
        ...reducerState,
        initData: action.data,
      };
    case "setChatMessages":
      return {
        ...reducerState,
        messages: action.data,
      };
    case Actions.setMoreMessages: {
      return {
        ...reducerState,
        messages: [...reducerState.messages, ...action.data],
      };
    }
    case "setNewMessage": {
      const { ChannelArn, message } = action.data;
      if (ChannelArn === reducerState.channelArn) {
        const itemExist =
          message?.pendingId &&
          reducerState.messages.find(
            (item) => item?.pendingId === message?.pendingId
          );

        const newMessages = itemExist
          ? reducerState.messages.map((item) => {
              if (item.pendingId === message.pendingId) {
                return {
                  ...item,
                  ...message,
                };
              }
              return item;
            })
          : [message, ...reducerState.messages];
        return {
          ...reducerState,
          messages: newMessages,
        };
      }
      return reducerState;
    }
    case "updateMessage": {
      const { message, ChannelArn } = action.data;
      if (reducerState.channelArn === ChannelArn) {
        const newMessages = reducerState.messages.map((item) => {
          if (item.MessageId === message.MessageId) {
            return {
              ...item,
              ...message,
            };
          }
          return item;
        });
        return {
          ...reducerState,
          messages: newMessages,
        };
      }
      return reducerState;
    }
    case "deleteMessage": {
      const { ChannelArn } = action.data;
      if (ChannelArn === reducerState.channelArn) {
        const newMessages = reducerState.messages.filter(
          (item) => item.MessageId !== action.data.message.MessageId
        );
        return {
          ...reducerState,
          messages: newMessages,
        };
      }
      return reducerState;
    }
    default:
      return reducerState;
  }
};
