const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

//3)ROUTE
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//Protecting all routes below this middleware
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.patch(
  '/updateMyData',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateData
);
router.delete('/deleteMyData', userController.deleteMe);
router.get('/me', userController.getMe, userController.getUser);

//Restricted all routes below this middleware
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
