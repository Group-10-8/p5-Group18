import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import './TopBar.css';
import axios from 'axios';

/**
 * TopBar with login state and photo upload
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);

    this.uploadInput = null;
    this.handleUpload = this.handleUpload.bind(this);
  }

  handleUpload(event) {
    event.preventDefault();

    if (!this.uploadInput || this.uploadInput.files.length === 0) return;

    const domForm = new FormData();
    domForm.append('uploadedphoto', this.uploadInput.files[0]);

    axios.post('/photos/new', domForm)
      .then((res) => {
        console.log('Upload success:', res.data);
        this.uploadInput.value = '';
      })
      .catch((err) => {
        console.error('Upload error:', err);
      });
  }

  render() {
    const { user, logout } = this.props;

    return (
      <AppBar className="topbar-appBar" position="fixed">
        <Toolbar className="topbar-toolbar">
          <Typography variant="h6" color="inherit">
            Group 18: Benjamin Taylor, Jordan Wise-Smith, Zack Brokaw, Kevin Richard, Rishi Jinwala
          </Typography>

          <div className="topbar-spacer" />

          <Typography variant="h6" color="inherit" style={{ marginRight: '16px' }}>
            {user ? `Hi ${user.first_name || user.login_name}` : 'Please Login'}
          </Typography>

          {user && (
            <Button color="inherit" onClick={logout} style={{ marginRight: '16px' }}>
              Logout
            </Button>
          )}

          {user && (
            <form onSubmit={this.handleUpload} className="topbar-upload-form">
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