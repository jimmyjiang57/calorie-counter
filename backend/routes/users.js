const router = require('express').Router();
let User = require('../models/user.model');
let Food = require('../models/food.model'); // Import the Food model

router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const username = req.body.username;

  const newUser = new User({username});

  newUser.save()
    .then(() => res.json('User added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete(async (req, res) => {
  try {
    // Find the user to get the username
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json('User not found.');

    // Delete all foods with this username
    await Food.deleteMany({ username: user.username });

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json('User and their foods deleted.');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;