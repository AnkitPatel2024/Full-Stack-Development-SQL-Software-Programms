//1.
import React from "react";
import { useAuth0 } from "@auth0/auth0-react"; 

import { Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
const config = require('../config.json');


const LoginButton = () => {
    const [profile, setProfile] = useState({});

    const get_profile = () => {
        if(profile){
            return profile;
        }else{
            fetch(
                `http://${config.server_host}:${config.server_port}/profile`
            )
              .then(res => res.json())
              .then(resJson => {
                setProfile(resJson);
              });
        }
    }

    const log_out = () => {
        console.log(profile)
        if(!profile){
            return
        }else{
            fetch(
                `http://${config.server_host}:${config.server_port}/logout?post_logout_redirect_uri=http://${config.server_host}:${config.server_port}/testauth`
            )
              .then(res => res.json())
              .then(resJson => {
                setProfile({});
              });
        }
    }

    

  return(
    <p>
        {   
            profile.sid ? <Button color={'secondary'} onClick={()=>log_out()}>Log Out</Button> :
            <Button color={'secondary'} onClick={()=>get_profile()}>Log in</Button>
        }
    </p>
    
  )
};

//3.
export default LoginButton;