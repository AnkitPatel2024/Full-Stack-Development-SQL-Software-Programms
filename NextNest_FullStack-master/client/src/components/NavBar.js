import { AppBar, Container, Toolbar, Typography, Box } from '@mui/material'
import { NavLink } from 'react-router-dom';
import LoginButton from './LoginButton';
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from './LogoutButton';
import UserMenu from './UserMenu';

// The hyperlinks in the NavBar contain a lot of repeated formatting code so a
// helper component NavText local to the file is defined to prevent repeated code.
const NavText = ({ href, text, isMain }) => {
  return (
    <Typography
      variant={isMain ? 'h5' : 'h7'}
      noWrap
      style={{
        marginRight: '30px',
        fontFamily: 'monospace',
        fontWeight: 700,
        letterSpacing: '.3rem',
      }}
    >
      <NavLink
        to={href}
        style={{
          color: 'inherit',
          textDecoration: 'none',
        }}
      >
        {text}
      </NavLink>
    </Typography>
  )
}


// Here, we define the NavBar. Note that we heavily leverage MUI components
// to make the component look nice. Feel free to try changing the formatting
// props to how it changes the look of the component.
export default function NavBar() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  return (
    <AppBar position='static'>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <NavText href='/' text='NextNest' isMain />
          <NavText href='/heatmap' text='Heatmap' />
          <NavText href='/compare' text='Compare' />
          <NavText href='/trends' text='Trends' />
          <NavText href='/search' text='Search' />
          <Box sx={{ marginLeft: "auto" }}>{ isAuthenticated ? <UserMenu /> : <LoginButton /> }</Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}