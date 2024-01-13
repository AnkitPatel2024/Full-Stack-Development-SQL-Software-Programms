//1.
import React from "react";
import { useAuth0 } from "@auth0/auth0-react"; 
import { Button } from "@mui/material";
import { useLocation } from 'react-router-dom'

const LoginButton = () => {
  //2.
  const { loginWithRedirect } = useAuth0();
  const location = useLocation();

  return <Button sx={{ marginLeft: "auto" }} style={{color:'white'}} onClick={() => loginWithRedirect({appState: {
    returnTo: location.pathname // here
    }})}>Log In</Button>;
};

//3.
export default LoginButton;
