import React from 'react';
import {
  AppBar, Toolbar, Typography
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import './TopBar.css';
import '../../lib/fetchModelData'

/**
 * TopBar function to provide app context
 */
function TopBarWrapper() {
  const location = useLocation();
  const path = location.pathname;

  let context = "";

  const userMatch = path.match(/^\/users\/([^/]+)$/);
  const photosMatch = path.match(/^\/photos\/([^/]+)$/);

  let user = null;

  if (userMatch) {
    const userId = userMatch[1];
    user = window.models.userModel(userId);
    if (user) {
      context = `${user.first_name} ${user.last_name}`;
    }
  } else if (photosMatch) {
    const userId = photosMatch[1];
    user = window.models.userModel(userId);
    if (user) {
      context = `Photos of ${user.first_name} ${user.last_name}`;
    }
  }

  return context ? <TopBar context={context} /> : <Typography>No data available</Typography>;
}

/**
 * Define TopBar, a React componment of project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
          <Typography variant="h5" color="inherit" className='topbar-name'>
            Group 18
          </Typography>
          <Typography variant="h5" color="inherit">
            {this.props.context || "No data available"}
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
