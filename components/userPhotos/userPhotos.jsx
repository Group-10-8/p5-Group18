import React from 'react';
import { Button, Typography, Divider, TextField, Modal } from '@mui/material';
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
    this.state = { 
      photos: [], 
      error: null, 
      loading: true,
      modalOpen: false,
      newComment: '',
      selectedPhotoId: null,
     };
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

  handleOpen = (photoId) => {
    this.setState({ selectedPhotoId: photoId });
  };

  handleClose = () => {
    this.setState({ selectedPhotoId: null, newComment: '' });
  };

  handleAddComment = () => {
    const { selectedPhotoId, newComment } = this.state;

    axios.post(`/commentsOfPhoto/${selectedPhotoId}`, {
      userId: this.props.currentUser._id,
      comment: newComment
    })
    .then(() => {
      this.fetchPhotos(this.props.match.params.userId);
      this.setState({ selectedPhotoId: null, newComment: '' });
    })
    .catch((err) => {
      console.error("Error adding comment:", err);
    });
  };

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
            <div className="comments-header">
              <Typography variant="caption" display="block" className="photo-date">
                Uploaded: {this.formatDate(photo.date_time)}
              </Typography>
              <Button onClick={() => this.handleOpen(photo._id)}>Add Comment</Button>
            </div>

            {this.state.selectedPhotoId === photo._id && (
              <Modal
                open={this.state.selectedPhotoId === photo._id}
                onClose={this.handleClose}
              >
                <div className="modal-container">
                  <div className="modal-header">
                    <Typography variant="h6" component="h2">
                      Add Comment
                    </Typography>
                    <Button onClick={this.handleAddComment}>Submit</Button>
                  </div>
                  <TextField
                    className="modal-textfield"
                    placeholder="Add your comment here"
                    multiline={true}
                    value={this.state.newComment}
                    onChange={(e) => this.setState({ newComment: e.target.value })}
                  />
                  <span className="modal-close-btn" onClick={this.handleClose}>
                    &times;
                  </span>
                </div>
              </Modal>
            )}

            {photo.comments?.length > 0 && (
              <div className="comments-container">
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Comments</Typography>
                {photo.comments.map((comment) => (
                  <div key={comment._id} className="comment-card">
                    <Typography variant="body2">
                      <Link to={`/users/${comment.user._id}`} className="comment-user">
                        <strong>{comment.user.first_name} {comment.user.last_name}</strong>
                      </Link>
                      <span className="comment-date"> • {this.formatDate(comment.date_time)}</span>
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
