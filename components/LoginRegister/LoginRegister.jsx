import React from 'react';
import {
  Button, Box, TextField, Alert, Accordion, AccordionSummary, AccordionDetails, Typography
} from '@mui/material';
import { withRouter } from 'react-router-dom';
import './LoginRegister.css';
import axios from 'axios';

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        first_name: '',
        last_name: '',
        location: '',
        description: '',
        occupation: '',
        login_name: '',
        password: '',
        password_repeat: '',
      },
      showLoginError: false,
      showRegistrationError: false,
      showRegistrationSuccess: false,
      showRegistration: false,
    };
  }

  handleChange = (event) => {
    const { id, value } = event.target;
    this.setState((prevState) => ({
      user: { ...prevState.user, [id]: value }
    }));
  }

  handleLogin = async () => {
    const { login_name, password } = this.state.user;

    try {
      const response = await axios.post('/admin/login', {
        login_name,
        password
      });

      this.setState({
        showLoginError: false,
        showRegistrationError: false,
        showRegistrationSuccess: false,
      });

      this.props.changeUser(response.data);
      this.props.history.push('/users');

    } catch (error) {
      console.error(error);

      this.setState({
        showLoginError: true,
        showRegistrationError: false,
        showRegistrationSuccess: false,
      });
    }
  };

  handleRegister = async () => {
    const { password, password_repeat } = this.state.user;
    if (password !== password_repeat) {
      this.setState({ showRegistrationError: true, showRegistrationSuccess: false });
      return;
    }

    try {
      const response = await axios.post('/user', this.state.user, {
        headers: { 'Content-Type': 'application/json' }
      });
      this.setState({
        showRegistrationSuccess: true,
        showRegistrationError: false,
        showLoginError: false,
        showRegistration: false,
        user: { ...this.state.user, password: '', password_repeat: '' }
      });
      this.props.changeUser(response.data);
      this.props.history.push('/users');
    } catch (error) {
      console.error(error);
      this.setState({
        showRegistrationError: true,
        showLoginError: false,
        showRegistrationSuccess: false,
      });
    }
  }

  toggleRegistration = () => {
    this.setState((prev) => ({ showRegistration: !prev.showRegistration }));
  }

  render() {
    const { user, showLoginError, showRegistrationError, showRegistrationSuccess, showRegistration } = this.state;

    return (
      <Box className="login-register-container" component="form" autoComplete="off">
        {showLoginError && <Alert severity="error" className="alert">Login Failed</Alert>}
        {showRegistrationError && <Alert severity="error" className="alert">Registration Failed</Alert>}
        {showRegistrationSuccess && <Alert severity="success" className="alert">Registration Succeeded</Alert>}

        <Typography variant="h5" className="form-title">Login</Typography>
        <TextField
          id="login_name"
          label="Login Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={user.login_name}
          onChange={this.handleChange}
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={user.password}
          onChange={this.handleChange}
        />
        <Button variant="contained" onClick={this.handleLogin} fullWidth className="form-button">
          Login
        </Button>

        <Accordion expanded={showRegistration} onChange={this.toggleRegistration} className="registration-accordion">
          <AccordionSummary
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>User Registration</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              id="password_repeat"
              label="Repeat Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={user.password_repeat}
              onChange={this.handleChange}
            />
            <TextField
              id="first_name"
              label="First Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={user.first_name}
              onChange={this.handleChange}
            />
            <TextField
              id="last_name"
              label="Last Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={user.last_name}
              onChange={this.handleChange}
            />
            <TextField
              id="location"
              label="Location"
              variant="outlined"
              fullWidth
              margin="normal"
              value={user.location}
              onChange={this.handleChange}
            />
            <TextField
              id="description"
              label="Description"
              variant="outlined"
              multiline
              rows={4}
              fullWidth
              margin="normal"
              value={user.description}
              onChange={this.handleChange}
            />
            <TextField
              id="occupation"
              label="Occupation"
              variant="outlined"
              fullWidth
              margin="normal"
              value={user.occupation}
              onChange={this.handleChange}
            />
            <Button variant="contained" onClick={this.handleRegister} fullWidth className="form-button">
              Register Me
            </Button>
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  }
}

export default withRouter(LoginRegister);