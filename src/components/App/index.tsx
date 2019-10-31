import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import "./App.css";
import Login from "../Login";
import LoginCallback from "../Login/Callback";

const App: React.FC = () => {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/oauth_callback" component={LoginCallback} />
        </Switch>
      </Router>
    </div>
  );
};

export default App;
