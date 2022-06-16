import { createSlice } from "@reduxjs/toolkit";

export const channelSlice = createSlice({
  name: "channel",
  initialState: {
    channelList: [],
    channelArn: "",
    channelMessages: [],
    nextToken: '',
  },
  reducers: {
    setChannels: (state, value) => {
      state.channelList = value.payload;
    },
    pushNewChannelMessage: (state, value) => {
      const channel = state.channelList.find(
        (c) => c.ChannelSummary.ChannelArn === value.payload.ChannelArn
      );

      if (!value.payload.incoming) {
        channel.lastMessage = value.payload.Content;
      }

      if (state.channelArn === value.payload.ChannelArn) {
        const { ChannelArn, ...restMessage } = value.payload;
        const messages = state.channelMessages;
        messages.push(restMessage);
        state.channelMessages = messages;
      }
    },
    updateChannelMessage: (state, value) => {
      const channel = state.channelList.find(
        (c) => c.ChannelSummary.ChannelArn === value.payload.ChannelArn
      );

      if (state.channelArn === value.payload.ChannelArn) {
        const message = state.channelMessages.find(
          (m) => m.MessageId === value.payload.MessageId
        );

        if (message) {
          message.Content = value.payload.Content;
        }
      }
    },
    deleteChannelMessage: (state, value) => {
      const channel = state.channelList.find(
        (c) => c.ChannelSummary.ChannelArn === value.payload.ChannelArn
      );

      if (state.channelArn === value.payload.ChannelArn) {
        const message = state.channelMessages.find(
          (m) => m.MessageId === value.payload.MessageId
        );

        if (message) {
          state.channelMessages = state.channelMessages.filter(
            (m) => m.MessageId !== value.payload.MessageId
          );
        }
      }
    },
    setChannelArn: (state, value) => {
      state.channelArn = value.payload;
      const channel = state.channelList.find(
        (c) => c.ChannelSummary.ChannelArn === value.payload
      );
      channel.lastMessage = "";
      state.channelMessages = [];
    },
    setChannelMessages: (state, value) => {
      // state.channelMessages = value.payload.reverse();
      const arr = value.payload.reverse();
      state.channelMessages = [...state.channelMessages, ...arr];
    },
    setNextToken: (state, value) => {
      state.nextToken = value.payload
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setChannels,
  setChannelArn,
  setChannelMessages,
  setNextToken,
  pushNewChannelMessage,
  updateChannelMessage,
  deleteChannelMessage,
} = channelSlice.actions;

export default channelSlice.reducer;
