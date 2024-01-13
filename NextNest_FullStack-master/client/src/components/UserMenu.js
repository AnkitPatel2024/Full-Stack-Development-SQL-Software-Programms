import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom';

export default function UserMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { logout, user } = useAuth0();
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  console.log(user)
  const navigate = useNavigate();

  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        style={{color:'white'}}
      >
        {user.name}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={()=>{navigate('/profile'); handleClose();}}>Profile</MenuItem>
        <MenuItem onClick={() => {logout({ returnTo: window.location.origin })}}>Logout</MenuItem>
      </Menu>
    </div>
  );
}