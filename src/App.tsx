import React from "react";
import "./App.css";
import { Dashboard } from "./screens/Dashboard";
import { ThemeProvider } from "styled-components";
import {
  MeetingProvider,
  lightTheme,
} from "amazon-chime-sdk-component-library-react";
import { ChatContextProvider } from "./context/chimeChat";
import { MeetingContextProvider } from "./context/chime";

function App() {
  return (
    <div className="App">
      <MeetingProvider>
        <ChatContextProvider>
          <MeetingContextProvider>
            <ThemeProvider theme={lightTheme}>
              <Dashboard />
            </ThemeProvider>
          </MeetingContextProvider>
        </ChatContextProvider>
      </MeetingProvider>
    </div>
  );
}

export default App;
