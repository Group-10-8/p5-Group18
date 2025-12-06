import React from 'react';
import { Button, Typography, Divider, TextField, Modal } from '@mui/material';
import './UserPhotos.css';
import axios from 'axios';
import { Link, withRouter } from 'react-router-dom'; //with router to updates correctly and history

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
      currentIndex: 0,
    };
  }

  //added and shows the correct photo with URL and syncs the whole display 
  syncIndexWithLocation = () => {  
    const { photos, currentIndex } = this.state;  

    if (!photos || photos.length === 0) {  
      return;  
    }  

    const search = (this.props.location && this.props.location.search) || '';  
    const params = new URLSearchParams(search);  
    const photoId = params.get('photoId');  

    let newIndex = 0; 
    if (photoId) {  
      const idx = photos.findIndex((p) => p._id === photoId);  
      if (idx >= 0) {  
        newIndex = idx;  
      }  
    }  

    if (newIndex !== currentIndex) {  
      this.setState({ currentIndex: newIndex });  
    }  
  };  


  fetchPhotos = (userId) => {
    axios.get(`/photosOfUser/${userId}`)
      .then(({ data }) => {
        this.setState({ photos: data || [], error: null, loading: false });
      })
      .catch((err) => {
        console.error("Error fetching photos:", err);
        this.setState({ photos: [], error: err, loading: false }, this.syncIndexWithLocation);
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

    // Re-fetch if an upload happened (TopBar notifies PhotoShare which bumps uploadCounter)
    if (prevProps.uploadCounter !== this.props.uploadCounter) {
      this.fetchPhotos(this.props.match.params.userId);
    }

    //added and this updates the display to show the correct image when URL changes
    if (
      prevProps.location &&
      this.props.location &&
      prevProps.location.search !== this.props.location.search &&
      this.state.photos.length
    ) {
      this.syncIndexWithLocation();  
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

    if (!newComment || newComment.trim() === "") {
      alert("Comment cannot be empty.");
      return;
    }

    axios.post(`/commentsOfPhoto/${selectedPhotoId}`, {
      comment: newComment.trim()
    })
      .then(() => {
        this.fetchPhotos(this.props.match.params.userId);
        this.setState({ selectedPhotoId: null, newComment: '' });
      })
      .catch((err) => {
        console.error("Error adding comment:", err);
        alert("Error adding comment.");
      });
  };

  handleDeletePhoto = (photoId) => {
    if (!this.props.user) {
      alert('You must be logged in to delete a photo.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this photo?')) return;

    axios.delete(`/photos/${photoId}`)
      .then(() => this.fetchPhotos(this.props.match.params.userId))
      .catch(err => {
        console.error('Error deleting photo:', err);
        const msg = err?.response?.data || err.message || 'Error deleting photo';
        alert(msg);
      });
  };

  handleDeleteComment = (commentId) => {
    if (!this.props.user) {
      alert('You must be logged in to delete a comment.');
      return;
    }

    if (!window.confirm('Delete this comment?')) return;

    axios.delete(`/comments/${commentId}`)
      .then(() => this.fetchPhotos(this.props.match.params.userId))
      .catch(err => {
        console.error('Error deleting comment:', err);
        const msg = err?.response?.data || err.message || 'Error deleting comment';
        alert(msg);
      });
  };

  //added and this updates display with next or previous photo and updates the URL
  handleStep = (direction) => {  
    const { photos, currentIndex } = this.state;  
    if (!photos || photos.length === 0) return;   

    const newIndex = currentIndex + direction;    
    if (newIndex < 0 || newIndex >= photos.length) {  
      return;                                     
    }                                             
    const userId = this.props.match.params.userId;     
    const newPhotoId = photos[newIndex]._id;           

    this.props.history.push(`/photos/${userId}?photoId=${newPhotoId}`);  
  };  


  render() {
    const { photos, error, loading, currentIndex } = this.state;

    if (loading) {
      return <Typography variant="body1">Loading photos...</Typography>;
    }

    if (error) {
      return <Typography color="error">Error loading photos.</Typography>;
    }

    if (!photos.length) {
      return <Typography>No photos available for this user.</Typography>;
    }

    const atFirst = currentIndex === 0; //disable prev button when cannot go further back                     
    const atLast = currentIndex === photos.length - 1; //disable the next button when cannot go further front

    //updated to only show one photo at a time based on URL, and added a next and prev button to change photos.
    return (
      <div className="user-photos-container">
        <div className="photo-stepper-controls">  
          <Button
            variant="contained"
            onClick={() => this.handleStep(-1)}   
            disabled={atFirst}                   
          >
            Previous
          </Button>

          <Typography variant="body2" sx={{ mx: 2 }}>  
            Photo {currentIndex + 1} of {photos.length} 
          </Typography>

          <Button
            variant="contained"
            onClick={() => this.handleStep(1)}    
            disabled={atLast}                    
          >
            Next
          </Button>
        </div>
        {photos.map((photo, index) => (
          index === currentIndex && (
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
              {this.props.user && this.props.user._id && photo.user_id && this.props.user._id.toString() === photo.user_id.toString() && (
                <Button color="error" onClick={() => this.handleDeletePhoto(photo._id)}>Delete Photo</Button>
              )}
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
                    {this.props.user && comment.user && comment.user._id && this.props.user._id && this.props.user._id.toString() === comment.user._id.toString() && (
                      <Button size="small" onClick={() => this.handleDeleteComment(comment._id)}>Delete Comment</Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          )
        ))}
      </div>
    );
  }
}

//so it updates correctly 
export default withRouter(UserPhotos);