import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { fetchCalories } from '../api'; // uses REACT_APP_API_URL under the hood

export default class CreateFood extends Component {
  constructor(props) {
    super(props);

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeCalories = this.onChangeCalories.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleAutofill = this.handleAutofill.bind(this);

    this.state = {
      username: '',
      description: '',
      calories: '',
      date: new Date(),
      users: [],
      isFilling: false,
      fillError: ''
    };
  }

  componentDidMount() {
    // If you have an API helper for users, you can swap this later.
    axios
      .get(`${process.env.REACT_APP_API_URL ?? 'http://localhost:5000'}/users/`)
      .then(response => {
        if (response.data.length > 0) {
          this.setState({
            users: response.data.map(user => user.username),
            username: response.data[0].username
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  onChangeUsername(e) {
    this.setState({ username: e.target.value });
  }

  onChangeDescription(e) {
    this.setState({ description: e.target.value });
  }

  onChangeCalories(e) {
    this.setState({ calories: e.target.value });
  }

  onChangeDate(date) {
    this.setState({ date });
  }

  async handleAutofill() {
    const query = (this.state.description || '').trim();
    if (!query) {
      this.setState({ fillError: 'Enter a description first (e.g., "1 banana").' });
      return;
    }
    try {
      this.setState({ isFilling: true, fillError: '' });
      const data = await fetchCalories(query); // calls /lookup/calories?q=...
      if (data && typeof data.calories === 'number') {
        this.setState({ calories: String(Math.round(data.calories)) });
      } else {
        this.setState({ fillError: 'No calories found for that item.' });
      }
    } catch (err) {
      this.setState({ fillError: 'Auto-fill failed. Try a simpler description.' });
    } finally {
      this.setState({ isFilling: false });
    }
  }

  onSubmit(e) {
    e.preventDefault();

    const food = {
      username: this.state.username,
      description: this.state.description,
      calories: Number(this.state.calories) || 0,
      date: this.state.date,
    };

    axios
      .post(`${process.env.REACT_APP_API_URL ?? 'http://localhost:5000'}/foods/add`, food)
      .then(res => {
        console.log(res.data);
        window.location = '/';
      })
      .catch(err => {
        console.error(err);
        // You could show an inline error here if you prefer not to redirect on failure
      });
  }

  render() {
    const { users, username, description, calories, date, isFilling, fillError } = this.state;

    return (
      <div>
        <h3>Create New Food Log</h3>
        <form onSubmit={this.onSubmit}>
          <div className="form-group">
            <label>Username: </label>
            <select
              required
              className="form-control"
              value={username}
              onChange={this.onChangeUsername}
            >
              {users.map((user) => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description: </label>
            <input
              type="text"
              required
              className="form-control"
              value={description}
              onChange={this.onChangeDescription}
              placeholder='e.g., "1 banana" or "2 eggs"'
            />
          </div>

          <div className="form-group">
            <label>
              Calories:{' '}
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={this.handleAutofill}
                disabled={isFilling}
                style={{ marginLeft: 8 }}
              >
                {isFilling ? 'Filling…' : 'Auto-fill'}
              </button>
            </label>
            <input
              type="text"
              className="form-control"
              value={calories}
              onChange={this.onChangeCalories}
              placeholder="e.g., 105"
            />
            {fillError ? (
              <small className="form-text text-danger">{fillError}</small>
            ) : (
              <small className="form-text text-muted">
                Tip: Use common phrases like &quot;1 banana&quot;, &quot;2 slices cheddar&quot;.
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Date: </label>
            <div>
              <DatePicker selected={date} onChange={this.onChangeDate} />
            </div>
          </div>

          <div className="form-group">
            <input type="submit" value="Create Food Log" className="btn btn-primary" />
          </div>
        </form>
      </div>
    );
  }
}
