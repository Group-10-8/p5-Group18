import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
}
from '@mui/material';
import './userList.css';
import { Link } from 'react-router-dom';

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
    fetchModel('/user/list')
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
    const { users } = this.state;

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
          {users.map((user, index) => (
            <React.Fragment key={user._id}>
              <ListItem>
                <ListItemText
                  primary={
                    <Link to={`/users/${user._id}`}>
                      {user.first_name} {user.last_name}
                    </Link>
                  }
                />
              </ListItem>
              {index !== users.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        <Typography variant="body1">
          The model now comes from <code>/user/list</code> using fetchModel.
        </Typography>
      </div>
    );
  }
}

export default UserList;
