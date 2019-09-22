import React from "react";
import styled from "@emotion/styled";

import logo from "../assets/logo.svg";
import Users from "./Users";
import "./App.css";

const App: React.FC = () => {
  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header> */}
      <Users />
    </div>
  );
};

export default App;
