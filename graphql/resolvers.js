const bcrypt = require('bcryptjs');
const validator = require('validator');

const User = require('../models/user');

module.exports = {
  createUser: async function({ userInput }, req) {
    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: 'Email is invalid.' });
    }
    if (validator.isEmpty(userInput.password) || (!validator.isLength(userInput.password, { min: 4 }))) {
      errors.push({ message: 'Password is too short.' });
    }
    if (errors.length > 0) {
      const error = new Error('Invalid input.');
      error.data = errors;
      throw error;
    }
    const existingUser = await User.findOne({email: userInput.email});
    if (existingUser) {
      const error = new Error('User exists already.');
      error.data = errors;
      error.code = 422;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPassword
    });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  }

  // USING PROMISES WITHOUT ASYNC AWAIT
  // createUser: function({ userInput }, req) {
  //   return User.findOne({email: userInput.email})
  //   .then(existingUser => {
  //     if (existingUser) {
  //       const error = new Error('User exists already.');
  //       throw error;
  //     }
  //     return bcrypt.hash(userInput.password, 12);
  //   })
  //   .then(hashedPassword => {
  //     const user = new User({
  //       email: userInput.email,
  //       name: userInput.name,
  //       password: hashedPassword
  //     });
  //     return user.save();
  //   })
  //   .then(createdUser => {
  //     return { ...createdUser._doc, _id: createdUser._id.toString() };
  //   })
  // }

};
