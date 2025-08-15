import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Food = props => (
  <tr>
    <td>{props.food.username}</td>
    <td>{props.food.description}</td>
    <td>{props.food.calories}</td>
    <td>{props.food.date.substring(0,10)}</td>
    <td>
      <Link to={"/edit/"+props.food._id}>edit</Link> | <a href="#" onClick={() => { props.deleteFood(props.food._id) }}>delete</a>
    </td>
  </tr>
)

export default class FoodsList extends Component {
  constructor(props) {
    super(props);

    this.deleteFood = this.deleteFood.bind(this);
    this.handleUserChange = this.handleUserChange.bind(this);

    this.state = {
      foods: [],
      users: [],
      selectedUser: ''
    };
  }

  componentDidMount() {
    // Fetch all users
    axios.get(`${process.env.REACT_APP_API_URL}/users/`)
      .then(response => {
        this.setState({ users: response.data });
        if (response.data.length > 0) {
          this.setState({ selectedUser: response.data[0].username }, this.fetchFoods);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  fetchFoods() {
    axios.get(`${process.env.REACT_APP_API_URL}/foods/`)
      .then(response => {
        this.setState({ foods: response.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  deleteFood(id) {
    axios.delete(`${process.env.REACT_APP_API_URL}/foods/`+id)
      .then(response => { console.log(response.data) });

    this.setState({
      foods: this.state.foods.filter(el => el._id !== id)
    })
  }

  handleUserChange(e) {
    this.setState({ selectedUser: e.target.value });
  }

  foodList() {
    return this.state.foods
      .filter(food => food.username === this.state.selectedUser)
      .map(currentfood => {
        return <Food food={currentfood} deleteFood={this.deleteFood} key={currentfood._id}/>;
      })
  }

  render() {
    return (
      <div>
        <h3>Logged Foods</h3>
        <div className="form-group">
          <label>Filter by user: </label>
          <select
            required
            className="form-control"
            value={this.state.selectedUser}
            onChange={this.handleUserChange}
          >
            {this.state.users.map(user => (
              <option key={user._id} value={user.username}>
                {user.username}
              </option>
            ))}
          </select>
        </div>
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th>Username</th>
              <th>Description</th>
              <th>Calories</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            { this.foodList() }
          </tbody>
        </table>
      </div>
    )
  }
}