import React from 'react';
import { Route } from 'react-router-dom';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { CircularProgress } from '@mui/material';

const ProtectedRoute = ({ component, ...args }) => (
  <Route
    component={withAuthenticationRequired(component, {
      onRedirecting: () => <CircularProgress />,
    })}
    {...args}
  />
);

export default ProtectedRoute;