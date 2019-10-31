import React, { FC, useState, useEffect, useCallback } from "react";
import { Card, Button, TextField, FormControl } from "@material-ui/core";
import styled from "@emotion/styled";

import { Google, Azure } from "./config";

const StyledCard = styled(Card)`
  padding: 20px;
  margin: 100px auto;
  max-width: 40vw;
  min-width: 300px;
  Button {
    margin-bottom: 20px;
  }
`;

const LoginComp: FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleGoogleLogin = useCallback(async () => {
    const qParams = [
      `redirect_uri=${Google.REDIRECT_URI}`,
      `scope=${Google.SCOPE}`,
      `login_hint=paramsinghvc@gmail.com`,
      `prompt=consent`,
      `state=google`
    ].join("&");
    try {
      const response = await fetch(`/api/auth-url/google?${qParams}`);
      const url = await response.text();
      window.location.assign(url);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleAzureLogin = useCallback(async () => {
    const qParams = [
      `redirect_uri=${Azure.REDIRECT_URI}`,
      `scope=${Azure.SCOPE}`,
      `state=azure`
    ].join("&");
    try {
      const response = await fetch(`/api/auth-url/azure?${qParams}`);
      const url = await response.text();
      window.location.assign(url);
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <StyledCard>
      <Button variant="contained" color="primary" onClick={handleGoogleLogin}>
        Login with Google
      </Button>
      <Button variant="contained" color="secondary" onClick={handleAzureLogin}>
        Login with Azure
      </Button>
    </StyledCard>
  );
};

export default LoginComp;
