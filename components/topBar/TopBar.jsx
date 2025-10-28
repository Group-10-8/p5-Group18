import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import './TopBar.css';
import axios from 'axios';

/**
 * Define TopBar, a React component for project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      error: null,
    };
  }
  componentDidMount() {
    this.fetchUserData();
    window.onhashchange = this.fetchUserData;
  }

  componentWillUnmount() {
    window.onhashchange = null;
  }

  // Function to fetch user data
  fetchUserData = () => {
    const hash = window.location.hash;
    const userId = hash.split('/')[2];

    axios.get(`/user/${userId}`)
      .then(({ data }) => {
        this.setState({ user: data, error: null });
      })
      .catch((err) => {
        this.setState({ user: null, error: 'Error loading user data' });
      });
  };

  render() {
    const { user } = this.state;

    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
          <Typography variant="h5" color="inherit" className="topbar-name">
            Group 18: Benjamin Taylor, Jordan Wise-Smith, Zack Brokaw, Kevin Richard, Rishi Jinwala
          </Typography>
          <Typography variant="h5" color="inherit">
            {user ? `${user.first_name} ${user.last_name}` : 'No data available'}
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;