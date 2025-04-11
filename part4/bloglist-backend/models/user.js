const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    minLength: [3, 'Username must be at least 3 characters long'],
  },
  name: String,
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [3, 'Password must be at least 3 characters long'],
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ],
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash // don't reveal password hash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User