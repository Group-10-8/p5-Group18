import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Grid, Paper } from '@mui/material';
import './styles/main.css';

import TopBar from './components/topBar/TopBar';
import UserDetail from './components/UserDetail/UserDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from './components/LoginRegister/LoginRegister';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: null,
    };
  }

  setCurrentUser = (user) => {
    this.setState({ currentUser: user });
  };

  handleLogout = () => {
    axios.post('/admin/logout')
      .then(() => {
        this.setState({ currentUser: null });
      })
      .catch(err => console.error(err));
  };


  render() {
    const { currentUser } = this.state;

    return (
      <HashRouter>
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TopBar user={currentUser} logout={this.handleLogout} />
            </Grid>
          </Grid>

          <div className="main-topbar-buffer" />

          <Grid container spacing={2}>
            {currentUser && (
              <Grid item sm={3}>
                <Paper className="main-grid-item">
                  <UserList user={currentUser} />
                </Paper>
              </Grid>
            )}
            <Grid item xs={12} sm={currentUser ? 9 : 12}>
              <Paper className="main-grid-item">
                <Switch>
                  <Route
                    path="/login"
                    render={(props) =>
                      currentUser ? (
                        <Redirect to="/users" />
                      ) : (
                        <LoginRegister {...props} changeUser={this.setCurrentUser} />
                      )
                    }
                  />
                  <Route
                    path="/users/:userId"
                    render={(props) =>
                      currentUser ? <UserDetail {...props} /> : <Redirect to="/login" />
                    }
                  />
                  <Route
                    path="/photos/:userId"
                    render={(props) =>
                      currentUser ? <UserPhotos {...props} /> : <Redirect to="/login" />
                    }
                  />
                  <Route
                    path="/users"
                    render={() =>
                      currentUser ? <UserList user={currentUser} /> : <Redirect to="/login" />
                    }
                  />
                  <Route
                    exact
                    path="/"
                    render={() =>
                      currentUser ? <Redirect to="/users" /> : <Redirect to="/login" />
                    }
                  />
                </Switch>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(<PhotoShare />, document.getElementById('photoshareapp'));