import React from "react";
import "./App.css";
import { Provider } from "react-redux";
import store from "./store";
import { Dashboard } from "./screens/Dashboard";
import { ThemeProvider } from "styled-components";
import {
  MeetingProvider,
  lightTheme,
} from "amazon-chime-sdk-component-library-react";
import { ChatContextProvider } from "./context/chimeChat";

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <ChatContextProvider>
          <ThemeProvider theme={lightTheme}>
            <MeetingProvider>
              <Dashboard />
            </MeetingProvider>
          </ThemeProvider>
        </ChatContextProvider>
      </Provider>
    </div>
  );
}

export default App;
