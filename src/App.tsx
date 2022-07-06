import React from "react";
import "./App.css";
import { Provider } from "react-redux";
import store from "./store";
import { Dashboard } from "./screens/Dashboard";

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <Dashboard />
      </Provider>
    </div>
  );
}

export default App;
