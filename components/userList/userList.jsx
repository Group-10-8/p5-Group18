import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import './UserList.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

/**
 * Helper: format date/time nicely.
 */
function formatTime(dt) {
  if (!dt) return '';
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return String(dt);
  }
}

/**
 * Helper: build human-readable activity line.
 */
function activityText(user) {
  const type = user.last_activity_type;
  const time = formatTime(user.last_activity_time);

  if (!type) return 'No activity yet';

  switch (type) {
    case 'photo':
      return `posted a photo • ${time}`;
    case 'comment':
      return `added a comment • ${time}`;
    case 'registered':
      return `registered as a user • ${time}`;
    case 'login':
      return `logged in • ${time}`;
    case 'logout':
      return `logged out • ${time}`;
    default:
      return `activity • ${time}`;
  }
}

/**
 * Define UserList, a React component of project #5/6
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      isLoading: true,
      error: null,
    };
    this.intervalId = null;
  }

  fetchUsers = () => {
    axios.get('/user/list')
      .then(({ data }) =>
        this.setState({
          users: data || [],
          isLoading: false,
          error: null,
        })
      )
      .catch((err) =>
        this.setState({
          users: [],
          isLoading: false,
          error: err?.statusText || 'Failed to load users.',
        })
      );
  };

  componentDidMount() {
    // Only fetch users if logged in
    if (!this.props.user) return;

    this.fetchUsers();

    // Auto-refresh every 10 seconds
    this.intervalId = setInterval(this.fetchUsers, 10000);
  }

  componentDidUpdate(prevProps) {
    // If user just logged in, start fetching + interval
    if (!prevProps.user && this.props.user) {
      this.setState({ isLoading: true }, this.fetchUsers);
      if (!this.intervalId) {
        this.intervalId = setInterval(this.fetchUsers, 10000);
      }
    }

    // If user just logged out, stop interval and clear data
    if (prevProps.user && !this.props.user) {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      this.setState({
        users: [],
        isLoading: false,
        error: null,
      });
    }
  }

  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
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

        <List component="nav">
          {users.map((u, index) => {
            const thumb =
              u.last_activity_type === 'photo' &&
              u.last_activity_photo_file_name
                ? `/images/${u.last_activity_photo_file_name}`
                : null;

            return (
              <React.Fragment key={u._id}>
                <ListItem>
                  {/** Thumbnail or initials avatar */}
                  <ListItemAvatar>
                    {thumb ? (
                      <Avatar
                        alt="thumb"
                        src={thumb}
                        variant="rounded"
                        sx={{ width: 40, height: 40 }}
                      />
                    ) : (
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {u.first_name?.[0]}
                        {u.last_name?.[0]}
                      </Avatar>
                    )}
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Link to={`/users/${u._id}`}>
                        {u.first_name} {u.last_name}
                      </Link>
                    }
                    secondary={activityText(u)}
                  />
                </ListItem>
                {index !== users.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>
      </div>
    );
  }
}

export default UserList;
