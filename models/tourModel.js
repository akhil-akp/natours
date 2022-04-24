const mongoose = require('mongoose');
const slugify = require('slugify');
//const User = require('./userModel');//This needed only during the emmbeding whlie in referencing its not required.

//const guides = require('./userModel');
//const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour name must be there!!'],
      unique: true,
      trim: true,
      minlength: [10, 'A tour name must have  more or equal to 10 characteres'],
      maxlength: [40, 'A tour name must have less or equal to 40 characteres'],
      //validate: [validator.isAlpha, 'Tour name must have only characters'],
    },

    slug: String,

    duration: {
      type: Number,
      required: [true, 'Tour duration must be there!!'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour maxGroupSize must be there!!'],
    },
    difficulty: {
      type: String,
      required: [true, 'Tour difficulty must be there!!'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must contained either :easy,meduim,difficult',
      },
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Tour rantingAverage must be more than or equal to 1'],
      max: [5, 'Tour ratingAverage must be less than oe equal to 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Tour price also must be there!!'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: `Price discount ({VALUE}) must be less than price!!`,
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Tour summary must be there!!'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Tour image cover must be there!!'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: new Date().toString(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
      //select: false,
    },
    startLocation: {
      //GeoJson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      //This is for referencing the users with tours on the basis of their id'S
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  //return (this.duration / 7).toFixed(2);
  let message;
  if (this.duration >= 7) {
    message = (this.duration / 7).toFixed(2);
  } else {
    message = `No weeks😢.Only ${this.duration} days!!`;
  }
  return message;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//DOCUMENT MIDDLEWARE
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//This middleware use for emmbeding the users into tours

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   console.log('This one is from second pre save middleware');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(this);
//   next();
// });

//QUERY MIDDLEWARE

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now().toString();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`It took ${Date.now() - this.start} milliseconds`);
  next();
});

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

//console.log(new Date().toString());
