import { createSlice } from "@reduxjs/toolkit";
import { faker } from "@faker-js/faker";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    userId: "ec2e6b4e-5428-4fdf-b6a8-16c274795c45",
    companion: {},
    companionList: [],
  },
  reducers: {
    setUserId: (state, value) => {
      state.userId = value.payload;
    },
    setCompanion: (state, value) => {
      state.companion = value.payload;
    },
    setCompanionList: (state, value) => {
      console.log("init compnanion list");

      let arr = value.payload.map((channel) => {
        let summary = channel.ChannelSummary;
        return {
          userId: JSON.parse(summary.Metadata).patientId,
          name: faker.name.findName(),
          avatarUrl: faker.image.avatar(),
        };
      });

      state.companionList = [...state.companionList, ...arr];
    },
  },
});

// Action creators are generated for each case reducer function
export const { setUserId, setCompanion, setCompanionList } = userSlice.actions;

export default userSlice.reducer;
