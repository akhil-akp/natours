const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
//const { modelName } = require('./tourModel');
//const { schema } = require('./tourModel');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email id!'],
  },

  password: {
    type: String,
    required: [true, 'Please provide your password!'],
    minlength: 8,
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      //This only works on create and save!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not same!!',
    },
  },

  photo: {
    type: String,
    default: 'default.jpg',
  },

  changedPasswordAt: Date,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  //Only run this fumction if the password was actually modified
  if (!this.isModified('password')) return next();
  //Hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //Delete the confirm password
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.changedPasswordAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  //this points to current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.verifyPassword = async function (
  loginPassword,
  signupPassword
) {
  return await bcrypt.compare(loginPassword, signupPassword);
};

userSchema.methods.LaterChangedPassword = function (JWTTimestamp) {
  if (this.changedPasswordAt) {
    const changeTimestamp = parseInt(
      this.changedPasswordAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changeTimestamp;
  }
  //False means password did not change
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
