import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
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

    this.uploadInput = null;
    this.handleUpload = this.handleUpload.bind(this);
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
      .catch(() => {
        this.setState({ user: null, error: 'Error loading user data' });
      });
  };

  handleUpload(event) {
    event.preventDefault();

    if (!this.uploadInput || this.uploadInput.files.length === 0) {
      return;
    }

    const domForm = new FormData();
    domForm.append('uploadedphoto', this.uploadInput.files[0]);

    axios.post('/photos/new', domForm)
      .then((res) => {
        console.log('Upload success:', res.data);
        // nothing else required by your story
        this.uploadInput.value = '';
      })
      .catch((err) => {
        console.error('Upload error:', err);
      });
  }

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

          {user && (
            <form onSubmit={this.handleUpload} style={{ marginLeft: '16px' }}>
              <input
                type="file"
                accept="image/*"
                ref={(domFileRef) => { this.uploadInput = domFileRef; }}
              />
              <Button type="submit" variant="contained" style={{ marginLeft: '8px' }}>
                Add Photo
              </Button>
            </form>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;