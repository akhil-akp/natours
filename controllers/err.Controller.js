const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  //const value = err.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
  //const message = `Duplicate field value :${value}.Please use another value!`;
  //---------------------------OR_____________________________________________
  const message = `Duplicate field name: '${err.keyValue.name}' already exists.Please choose another one.`;
  return new AppError(message, 400);
};

const handleValidationErrDB = (err) => {
  const error = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data:${error.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTSignatureErr = () =>
  new AppError('Invalid token ! Please login again !!', 401);

const handleJWTExpriedErr = () =>
  new AppError('Token time has been expired ! Please login again!!', 401);

const sendErrDev = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      err,
    });
  } else {
    //RENDERD WEBSITE
    console.log('Error', err);
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!!',
      msg: err.message,
    });
  }
};

const sendErrProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    //1)API
    //A)Operational,trusted error:can be send to the clients
    //console.log(err);
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

      //B)Programming or other unknown error details don't leak to the clients
    }
    //Log the error
    console.log('Error', err);
    //Send generic message to the clients
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!!',
    });
  }
  //2)RENDERD WEBSITE
  //A)Operational,trusted error:can be send to the clients
  //console.log(err);
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!!',
      msg: err.message,
    });

    //B)Programming or other unknown error details don't leak to the clients
  }
  //Log the error
  console.log('Error', err);
  //Send generic message to the clients
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!!',
    msg: 'Please try again later!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTSignatureErr();
    if (error.name === 'TokenExpiredError') error = handleJWTExpriedErr();
    sendErrProd(error, req, res);
  }
};
