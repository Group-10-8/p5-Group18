import React from 'react';
import {
  Typography
} from '@mui/material';
import './userDetail.css';
import fetchModel from '../../lib/fetchModelData';

/**
 * Define UserDetail, a React component of project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { userId } = this.props.match.params;
    fetchModel(`/user/${userId}`)
      .then(({ data }) => this.setState({ user: data, error: null }))
      .catch((err) => this.setState({ user: null, error: err }));
  }

  render() {
    const user = this.state.user;
    if(!user) {
      return (
        <Typography variant="body1">
          Loading user details...
        </Typography>
      );
    }
    return (
      <Typography variant="body1" className="user-detail">
        <h2> {user.first_name} {user.last_name} </h2>
        
        <p> <b>Location:</b> {user.location} </p>
        
        <p> <b>Occupation:</b> {user.occupation} </p>
        
        <p><b>Description:</b> {user.description}</p>
        <p>
          <a href={`#/photos/${user._id}`}>
            View Photos of {user.first_name}
          </a>
        </p>
      </Typography>
    );
  }
}

export default UserDetail;
