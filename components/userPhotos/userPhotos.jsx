import React from 'react';
import { Typography } from '@mui/material';
import './userPhotos.css';
import fetchModel from '../../lib/fetchModelData';

/**
 * Define UserPhotos, a React component of project #5
 */

class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = { photos: [], error: null };
  }

  componentDidMount() {
    const { userId } = this.props.match.params;
    fetchModel(`/photosOfUser/${userId}`)
      .then(({ data }) => this.setState({ photos: data || [], error: null }))
      .catch((err) => this.setState({ photos: [], error: err }));
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      const { userId } = this.props.match.params;
      fetchModel(`/photosOfUser/${userId}`)
        .then(({ data }) => this.setState({ photos: data || [], error: null }))
        .catch((err) => this.setState({ photos: [], error: err }));
    }
  }

  render() {
    return (
      <>
        <Typography variant="body1" component="div">
          This should be the UserPhotos view of the PhotoShare app. Since
          it is invoked from React Router the params from the route will be
          in property match. So this should show details of user:
          {this.props.match.params.userId}. You can fetch the model for the user from
          window.models.photoOfUserModel(userId):
          <Typography
            variant="caption"
            component="pre"
            className="dev-json"
            aria-hidden="true"
          >
            {JSON.stringify(window.models.photoOfUserModel(this.props.match.params.userId), null, 2)}
          </Typography>
        </Typography>

        <div className="user-photos-container">
          {this.state.photos.map((p) => (
            <div key={p._id} className="photo-card">
              <img
                className="photo-img"
                src={`/images/${p.file_name}`}
                alt={p.file_name}
              />
              <Typography variant="caption" display="block">
                {p.date_time}
              </Typography>
            </div>
          ))}
        </div>
      </>
    );
  }
}

export default UserPhotos;
