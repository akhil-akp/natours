const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
//const { createReview } = require('../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  yearWiseTours,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
} = require('../controllers/tourController');

const router = express.Router();

//POST tour/2545dffaa8d9e84d/review
//GET tour/2545dffaa8d9e84d/review

// router
//   .route('/:tourId/reviews')
//   .post(protect, restrictTo('user'), createReview);

router.use('/:tourId/reviews', reviewRouter);

// router.param('id', checkID);
router.route('/top-5-tours').get(aliasTopTours, getAllTours);
router
  .route('/year-Tours/:year')
  .get(protect, restrictTo('admin', 'lead - guide', 'guide'), yearWiseTours);
router.route('/stats-tours').get(getTourStats);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead - guide'), createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead - guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protect, restrictTo('admin', 'lead - guide'), deleteTour);

module.exports = router;
