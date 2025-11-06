import React from 'react';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import './userDetail.css';
import axios from 'axios';

/**
 * Define UserDetail, a React component of project #5
 */

class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: null, error: null };
  }

  componentDidMount() { this.loadUser(); }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      this.loadUser();
    }
  }

  loadUser = () => {
    const { userId } = this.props.match.params;
    axios.get(`/user/${userId}`)
      .then(({ data }) => this.setState({ user: data, error: null }))
      .catch((err) => this.setState({ user: null, error: err }));
  };

  render() {
    const user = this.state.user;
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
      </Typography>
    );
  }
}

export default UserDetail;
