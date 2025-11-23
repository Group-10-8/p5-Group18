import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import './UserList.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

/**
 * Define UserList, a React component of project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      isLoading: true,
      error: null,
    };
  }

  componentDidMount() {
    // Only fetch users if logged in
    if (!this.props.user) return;

    axios.get('/user/list')
      .then(({ data }) =>
        this.setState({
          users: data || [],
          isLoading: false,
        })
      )
      .catch((err) =>
        this.setState({
          users: [],
          isLoading: false,
          error: err?.statusText || "Failed to load users.",
        })
      );
  }

  render() {
    const { users, isLoading, error } = this.state;
    const { user } = this.props;

    if (!user) {
      return (
        <Typography variant="body1">
          Please log in to see the user list.
        </Typography>
      );
    }

    if (isLoading) {
      return <Typography>Loading users...</Typography>;
    }

    if (error) {
      return <Typography color="error">{error}</Typography>;
    }

    return (
      <div className="user-list">
        <Typography variant="h6" className="user-list__title">
          Users
        </Typography>

        <Typography variant="body1">
          This is the user list, which takes up 3/12 of the window.
          You might choose to use{" "}
          <a href="https://mui.com/components/lists/">Lists</a> and{" "}
          <a href="https://mui.com/components/dividers/">Dividers</a> to
          display your users like so:
        </Typography>

        <List component="nav">
          {users.map((u, index) => (
            <React.Fragment key={u._id}>
              <ListItem>
                <ListItemText
                  primary={
                    <Link to={`/users/${u._id}`}>
                      {u.first_name} {u.last_name}
                    </Link>
                  }
                />
              </ListItem>
              {index !== users.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        <Typography variant="body1">
          The model now comes from <code>/user/list</code> using axios.
        </Typography>
      </div>
    );
  }
}

export default UserList;
