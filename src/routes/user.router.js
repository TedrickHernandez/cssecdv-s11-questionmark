const userRouter = require('express').Router();
const usersController = require('../controllers/user.controller');

userRouter.post('/createUser', usersController.createUser);
userRouter.post('/verifyUser', usersController.verifyUser);

module.exports = userRouter;