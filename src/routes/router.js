const Router = require('express').Router;
const path = require('path');
const { removeSession, verifyAdminSession, getEmailFromSession} = require('../controllers/session.controller');
const uploadPath = 'uploads/profilePic'
const multerConfig = require('../../utils/multerConfig')
const multer = multerConfig(path.join('public', uploadPath))
const usersController = require('../controllers/user.controller');
const friendsController = require('../controllers/friends.controller');
const router = Router();

router.get('/', (req, res) => {
    res.redirect('/home');
});

router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login',
        scripts: [{
            script: 'login.js'
        }]
    })
});

router.get('/register', (req, res) => {
    res.render('registration', {
        title: 'Register',
    })
    // res.sendFile(path.join(__dirname, '../../views', 'registration.html'));
})

router.get('/home', (req, res) => {
    res.render('home', {
        title: 'Home'
    })
})

router.get('/dashboard', getEmailFromSession, usersController.getUserDashboard);

router.get('/profile', getEmailFromSession, usersController.getUserProfile);

router.get('/editProfile', (req, res) => {
    res.render('editProfile', {
        title: 'Edit Profile'
    })
    // res.sendFile(path.join(__dirname, '../../views', 'editProfile.html'));
})

router.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views', 'userSettings.html'));
})

router.post('/register', multer.upload.single('profilePhoto'), usersController.createUser)

// Logout Endpoint
router.post('/logout', removeSession, (req, res) => {
    res.redirect('/login'); // Redirect to login
});

router.get('/admin', verifyAdminSession, usersController.getAllUsers);

router.post('/pokeUser', verifyAdminSession, usersController.pokeUser);

router.post('/confirmPoke', getEmailFromSession, usersController.confirmPoke)

router.post('/addFriend', getEmailFromSession, friendsController.addFriend)

router.post('/unfriend', getEmailFromSession, friendsController.unfriend)

router.post('/adminize', verifyAdminSession, usersController.adminize)

module.exports = router;