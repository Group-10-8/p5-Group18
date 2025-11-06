import React from 'react';
import { Typography, Divider } from '@mui/material';
import './userPhotos.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

/**
 * UserPhotos Component
 * Fetches and displays photos for a specific user with comments.
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = { photos: [], error: null, loading: true };
  }

  fetchPhotos = (userId) => {
    axios.get(`/photosOfUser/${userId}`)
      .then(({ data }) => {
        this.setState({ photos: data || [], error: null, loading: false });
      })
      .catch((err) => {
        console.error("Error fetching photos:", err);
        this.setState({ photos: [], error: err, loading: false });
      });
  };

  componentDidMount() {
    const { userId } = this.props.match.params;
    this.fetchPhotos(userId);
  }

  componentDidUpdate(prevProps) {
    const prevId = prevProps.match.params.userId;
    const currentId = this.props.match.params.userId;
    if (prevId !== currentId) {
      this.fetchPhotos(currentId);
    }
  }

  formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  }

  render() {
    const { photos, error, loading } = this.state;

    if (loading) {
      return <Typography variant="body1">Loading photos...</Typography>;
    }

    if (error) {
      return <Typography color="error">Error loading photos.</Typography>;
    }

    if (!photos.length) {
      return <Typography>No photos available for this user.</Typography>;
    }

    return (
      <div className="user-photos-container">
        {photos.map((photo) => (
          <div key={photo._id} className="photo-card">
            <img
              className="photo-img"
              src={`/images/${photo.file_name}`}
              alt={photo.file_name}
            />

            <Typography
              variant="caption"
              display="block"
              className="photo-date"
            >
              Uploaded: {this.formatDate(photo.date_time)}
            </Typography>

            {photo.comments && photo.comments.length > 0 && (
              <div className="comments-container">
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Comments
                </Typography>
                {photo.comments.map((comment) => (
                  <div key={comment._id} className="comment-card">
                    <Typography variant="body2">
                      <Link to={`/users/${comment.user._id}`} className="comment-user">
                        <strong>
                          {comment.user.first_name} {comment.user.last_name}
                        </strong>
                      </Link>
                      <span className="comment-date">
                        {' '}• {this.formatDate(comment.date_time)}
                      </span>
                    </Typography>
                    <Typography variant="body2" className="comment-text">
                      {comment.comment}
                    </Typography>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
}

export default UserPhotos;
