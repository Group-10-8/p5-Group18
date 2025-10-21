import React from 'react';
import {
  Typography
} from '@mui/material';
import './userDetail.css';


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
    return (
      <Typography variant="body1">
        This should be the UserDetail view of the PhotoShare app. Since
        it is invoked from React Router the params from the route will be
        in property match. So this should show details of user:
        {this.props.match.params.userId}. You can fetch the model for the
        user from window.models.userModel(userId).
      </Typography>
    );
  }
}

export default UserDetail;
