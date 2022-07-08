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

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <ThemeProvider theme={lightTheme}>
          {/*@ts-ignore */}
          <MeetingProvider>
            <Dashboard />
          </MeetingProvider>
        </ThemeProvider>
      </Provider>
    </div>
  );
}

export default App;
