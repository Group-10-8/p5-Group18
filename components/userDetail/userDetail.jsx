import React from 'react';
import { Typography, Button } from '@mui/material';
import { Link, withRouter } from 'react-router-dom';
import './UserDetail.css';
import axios from 'axios';

/**
 * Define UserDetail, a React component of project #5
 */

class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    // existing state; additional fields (mostRecentPhoto, mostCommentedPhoto)
    // are added later via setState so we don't disturb other code.
    this.state = { user: null, error: null };
  }

  componentDidMount() {
    this.loadUser();
    this.loadUsagePhotos(this.props.match.params.userId);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      this.loadUser();
      this.loadUsagePhotos(this.props.match.params.userId);
    }
  }

  loadUser = () => {
    const { userId } = this.props.match.params;
    axios.get(`/user/${userId}`)
      .then(({ data }) => this.setState({ user: data, error: null }))
      .catch((err) => this.setState({ user: null, error: err }));
  };

  // NEW: load photos for this user and compute
  // (1) most recent photo
  // (2) photo with most comments
  loadUsagePhotos = (userId) => {
    axios.get(`/photosOfUser/${userId}`)
      .then(({ data }) => {
        const photos = data || [];
        if (!photos.length) {
          this.setState({
            mostRecentPhoto: null,
            mostCommentedPhoto: null
          });
          return;
        }

        let mostRecentPhoto = photos[0];
        let mostCommentedPhoto = photos[0];

        photos.forEach((photo) => {
          // most recent by date_time
          if (new Date(photo.date_time) > new Date(mostRecentPhoto.date_time)) {
            mostRecentPhoto = photo;
          }

          // most comments by comments.length
          const commentCount = photo.comments ? photo.comments.length : 0;
          const bestCount = mostCommentedPhoto.comments
            ? mostCommentedPhoto.comments.length
            : 0;

          if (commentCount > bestCount) {
            mostCommentedPhoto = photo;
          }
        });

        this.setState({ mostRecentPhoto, mostCommentedPhoto });
      })
      .catch((err) => {
        console.error('Error loading usage photos:', err);
        // don’t overwrite user/error; just log
      });
  };

  render() {
    const user = this.state.user;
    const { mostRecentPhoto, mostCommentedPhoto } = this.state;

    if (!user) {
      return <Typography variant="body1">Loading user details...</Typography>;
    }
    return (
      <Typography variant="body1" component="div" className="user-detail">
        <h2>{user.first_name} {user.last_name}</h2>

        <p><b>Location:</b> {user.location}</p>
        <p><b>Occupation:</b> {user.occupation}</p>
        <p><b>Description:</b> {user.description}</p>
        <p>
          <Link to={`/photos/${user._id}`}>
            View Photos of {user.first_name}
          </Link>
        </p>

        {/* NEW: usage section */}
        {(mostRecentPhoto || mostCommentedPhoto) && (
          <div className="user-usage">
            <h3>Photo usage</h3>
            <div
              style={{
                display: 'flex',
                gap: '24px',
                flexWrap: 'wrap',
                marginTop: '8px'
              }}
            >
              {mostRecentPhoto && (
                <div className="user-usage-card">
                  <div><b>Most recently uploaded photo</b></div>
                  <Link to={`/photos/${user._id}?photoId=${mostRecentPhoto._id}`}>
                    <img
                      src={`/images/${mostRecentPhoto.file_name}`}
                      alt="Most recent"
                      style={{
                        width: '120px',
                        height: 'auto',
                        cursor: 'pointer',
                        display: 'block',
                        marginTop: '4px'
                      }}
                    />
                  </Link>
                  <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                    Uploaded: {new Date(mostRecentPhoto.date_time).toLocaleString()}
                  </div>
                </div>
              )}

              {mostCommentedPhoto && (
                <div className="user-usage-card">
                  <div><b>Photo with most comments</b></div>
                  <Link to={`/photos/${user._id}?photoId=${mostCommentedPhoto._id}`}>
                    <img
                      src={`/images/${mostCommentedPhoto.file_name}`}
                      alt="Most commented"
                      style={{
                        width: '120px',
                        height: 'auto',
                        cursor: 'pointer',
                        display: 'block',
                        marginTop: '4px'
                      }}
                    />
                  </Link>
                  <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                    Comments: {mostCommentedPhoto.comments ? mostCommentedPhoto.comments.length : 0}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {this.props.user && String(this.props.user._id) === String(user._id) && (
          <div>
            <Button
              color="error"
              onClick={() => {
                if (!window.confirm('Delete your account? This cannot be undone.')) return;
                axios.delete('/user/deleteAccount')
                  .then(() => {
                    if (this.props.changeUser) this.props.changeUser(null);
                    localStorage.removeItem('currentUser');
                    window.location.href = '#/login';
                  })
                  .catch(err => {
                    console.error('Error deleting account:', err);
                    const msg = err?.response?.data || err.message || 'Error deleting account';
                    alert(msg);
                  });
              }}
            >
              Delete Account
            </Button>
          </div>
        )}
      </Typography>
    );
  }
}

export default withRouter(UserDetail);