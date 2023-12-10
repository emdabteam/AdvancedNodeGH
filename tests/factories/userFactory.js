const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = () => {
  return new User({}).save();
};

// const id = '64f587bfda398a43847e0aa7';