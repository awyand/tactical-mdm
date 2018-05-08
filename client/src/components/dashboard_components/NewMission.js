// Modules
import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

// Project Files
import API from '../../utils/API.js';

// Project Components
import Phone from './Phone';
import PhoneRoster from './PhoneRoster';

// Material-UI Components
import TextField from 'material-ui-next/TextField';
import { FormControl, FormGroup, FormControlLabel } from 'material-ui-next/Form';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import Input, { InputLabel } from 'material-ui-next/Input';
import Select from 'material-ui-next/Select';
import { MenuItem } from 'material-ui-next/Menu';
import Button from 'material-ui-next/Button';
import Checkbox from 'material-ui-next/Checkbox';
import Tooltip from 'material-ui-next/Tooltip';
import Snackbar from 'material-ui-next/Snackbar';
import IconButton from 'material-ui-next/IconButton';
import CloseIcon from '@material-ui/icons/Close';

// Styles
const styles = {
  newMissionContainer: {
    width: '90%',
    margin: '80px auto 0 auto'
  },
  missionInfoAndRosterContainer: {
    width: '40%',
    height: '100%',
    float: 'left'
  },
  missionInfoCard: {
    padding: '8px',
    textAlign: 'center',
    width: '100%'
  },
  missionField: {
    margin: '10px auto'
  },
  phoneRosterCard: {
    width: '100%',
    marginTop: '30px',
    textAlign: 'center',
    height: '240px'
  },
  phoneConfigContainer: {
    marginLeft: '45%'
  },
  phoneCard: {
    width: '100%',
    textAlign: 'center',
    margin: '0 auto'
  }
}

// Component Export
export default class NewMission extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false,
      activateOnSave: false,
      missionData: {
        numPhones: 0,
        name: '',
        phones: [],
        active: false,
        location: ''
      },
      activePhone: '',
      activePhoneSavedState: {},
      savedPhones: [],
      isReadyToSave: false,
      snackbarOpen: false,
      snackbarText: ''
    };

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleLocationChange = this.handleLocationChange.bind(this);
    this.handleNumPhonesChange = this.handleNumPhonesChange.bind(this);
    this.handleActivateOnSaveChange = this.handleActivateOnSaveChange.bind(this);
    this.handleRosterPhoneClick = this.handleRosterPhoneClick.bind(this);
    this.handleSavePhone = this.handleSavePhone.bind(this);
    this.handleAddMission = this.handleAddMission.bind(this);
    this.handleSnackbarOpen = this.handleSnackbarOpen.bind(this);
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
  }

  // Mission Information box change handlers
  handleNameChange = event => {
    this.setState({
      missionData: { ...this.state.missionData, name: event.target.value }
    });
  }

  handleLocationChange = event => {
    this.setState({
      missionData: { ...this.state.missionData, location: event.target.value }
    })
  }

  handleNumPhonesChange = event => {
    this.setState({
      missionData: { ...this.state.missionData, numPhones: event.target.value }
    });
    this.forceUpdate();
  }

  handleActivateOnSaveChange = event => {
    this.setState({
      activateOnSave: event.target.checked,
      missionData: { ...this.state.missionData, active: event.target.checked }
    })
  }

  // Roster click handler
  handleRosterPhoneClick = event => {

    // Check to see if phone is already in phone array
    const match = this.state.missionData.phones.find(phone => phone.name === event.target.name);

    this.setState({
      activePhoneSavedState: match,
      activePhone: event.target.name
    });

  }

  // Handle save phone click handler
  handleSavePhone = newPhone => {
    const match = this.state.missionData.phones.find(phone => phone.name === newPhone.name);

    if (match) {
      const matchedIndex = this.state.missionData.phones.indexOf(match);
      this.state.missionData.phones[matchedIndex] = newPhone;
    } else {
      const updatedPhonesArray = this.state.missionData.phones.concat(newPhone);
      this.setState({
        missionData: { ...this.state.missionData, phones: updatedPhonesArray}
      });
    }

    // Add phone to savedPhones array if it's not already there
    if (this.state.savedPhones && !this.state.savedPhones.includes(newPhone.name)) {
      this.setState({
        savedPhones: this.state.savedPhones.concat(newPhone.name)
      })
    }

    // Check to see if all phones have been saved
    if (this.state.savedPhones && this.state.savedPhones.length === this.state.missionData.numPhones) {
      this.setState({
        isReadyToSave: true
      });
    } else {
      this.setState({
        isReadyToSave: false
      })
    }
  }

  // Submit Mission button click handler
  handleAddMission = event => {
    event.preventDefault();

    // Mission info validation
    if (this.state.missionData.name === '') {
      this.setState({ snackbarText: 'Please enter a mission name'});
      setTimeout(() => this.handleSnackbarOpen(), 1);
      return;
    } else if (this.state.missionData.location === '') {
      this.setState({ snackbarText: 'Please enter a location'});
      setTimeout(() => this.handleSnackbarOpen(), 1);
      return;
    }

    API.addMission(this.props.userId, this.state.missionData)
    .then(res => {
      console.log('API response:');
      console.log(res);
      // add logic for good status res
      this.setState({
        redirect: true
      });
    })
    .catch(err => console.log(err));
  }

  handleSnackbarOpen = () => {
    this.setState({ snackbarOpen: true });
  }

  handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({ snackbarOpen: false });
  }



  render() {

    // If redirect is true (made true by handleAddMission)
    if (this.state.redirect) {
      // If activateOnSave is true
      if (this.state.activateOnSave) {
        // Redirect to Active Missions
        return <Redirect push to='/active' />
      } else {
        // Redirect to Inactive Missions
        return <Redirect push to='/inactive' />
      }
    }

    return (

      <div style={styles.newMissionContainer}>

        <div style={styles.missionInfoAndRosterContainer}>

          <Card style={styles.missionInfoCard}>
            <CardTitle title="Mission Information" />

              <TextField
                id='missionName'
                label='Mission Name'
                value={this.state.missionData.name}
                onChange={this.handleNameChange}
                placeholder='Op Fury'
                style={styles.missionField}
              />

              <br />

              <TextField
                id='missionLocation'
                label='Location'
                value={this.state.missionData.location}
                onChange={this.handleLocationChange}
                placeholder='Baghdad, Iraq'
                style={styles.missionField}
              />

              <br />

              <FormControl style={styles.missionField}>
                <InputLabel htmlFor="numPhones">Phones</InputLabel>
                <Select
                  value={this.state.missionData.numPhones}
                  onChange={this.handleNumPhonesChange}
                  inputProps={{
                    name: 'numPhones',
                    id: 'numPhones',
                  }}
                >
                  <MenuItem value={0}>0</MenuItem>
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                </Select>
              </FormControl>

              <Tooltip id='tooltip-addMission'
                       title={this.state.isReadyToSave ? 'Ready to save!' : 'Please save all phones.'}
                       placement='top'>
                <div>
                  <Button
                    variant="raised"
                    color="primary"
                    onClick={this.handleAddMission}
                    disabled={!this.state.isReadyToSave}
                  >
                    Add Mission
                  </Button>
                </div>
              </Tooltip>

              <br />

              <FormControlLabel
                control={
                  <Checkbox checked={this.state.activateOnSave}
                    onChange={this.handleActivateOnSaveChange}
                    value="activateOnSave"
                  />
                }
                label="Activate on save"
              />

          </Card>



          {
            this.state.missionData.numPhones > 0 &&
            <Card style={styles.phoneRosterCard}>
              <CardTitle title="Phone Roster" />
                <PhoneRoster handleRosterPhoneClick={this.handleRosterPhoneClick}
                             numPhones={this.state.missionData.numPhones}
                             savedPhones={this.state.savedPhones}
                />

              </Card>
          }

        </div>

        <div style={styles.phoneConfigContainer}>
          {
            this.state.activePhone &&
              <Card>
                <Phone id={this.state.activePhone}
                       name={this.state.activePhone}
                       handleSavePhone={this.handleSavePhone}
                       savedState={this.state.activePhoneSavedState}
                       key={this.state.activePhone}
                       style={styles.phoneCard}
                />
              </Card>
          }
        </div>

        <div>
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            open={this.state.snackbarOpen}
            autoHideDuration={6000}
            onClose={this.handleSnackbarClose}
            ContentProps={{
              'aria-describedby': 'snack-message-id',
            }}
            message={<span id="snack-message-id">{this.state.snackbarText}</span>}
            action={[
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={this.handleSnackbarClose}
              >
                <CloseIcon />
              </IconButton>,
            ]}
          />
      </div>


    </div>
    )
  }
}
