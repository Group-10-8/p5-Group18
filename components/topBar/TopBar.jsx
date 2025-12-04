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
    // Support being called from a change event or a form submit.
    try {
      if (event && typeof event.preventDefault === 'function') event.preventDefault();
    } catch (e) {}

    const file = this.uploadInput && this.uploadInput.files && this.uploadInput.files[0];
    if (!file) return;

    const domForm = new FormData();
    domForm.append('uploadedphoto', file);

    axios.post('/photos/new', domForm)
      .then((res) => {
        console.log('Upload success:', res.data);
        // clear the input so the same file can be selected again later
        if (this.uploadInput) this.uploadInput.value = '';
        // notify parent that upload succeeded so UI can refresh
        if (this.props.onUpload) {
          try { this.props.onUpload(res.data); } catch (e) { console.warn('onUpload handler failed', e); }
        }
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
            <div className="topbar-upload-form">
              <input
                type="file"
                accept="image/*"
                ref={(domFileRef) => { this.uploadInput = domFileRef; }}
                onChange={this.handleUpload}
                style={{ display: 'none' }}
              />
              <Button variant="contained" style={{ marginLeft: '8px' }} onClick={() => { if (this.uploadInput) this.uploadInput.click(); }}>
                Add Photo
              </Button>
            </div>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;