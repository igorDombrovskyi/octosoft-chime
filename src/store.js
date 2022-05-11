import { configureStore } from "@reduxjs/toolkit";
import channelSlice from "./features/channel";
import userSlice from "./features/user";

export default configureStore({
  reducer: {
    channel: channelSlice,
    user: userSlice,
  },
});
