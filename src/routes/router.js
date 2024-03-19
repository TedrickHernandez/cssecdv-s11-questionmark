const Router = require('express').Router;
const path = require('path');
const { removeSession, verifyAdminSession } = require('../controllers/session.controller');
const uploadPath = 'uploads/profilePic'
const multerConfig = require('../../utils/multerConfig')
const multer = multerConfig(path.join('public', uploadPath))
const usersController = require('../controllers/user.controller');
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

router.get('/userDashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views', 'userDashboard.html'));
})

router.get('/profile', (req, res) => { // ATTENTION: FOR TESTING PURPOSES ONLY!!!
    res.render('profile', {
        title: 'Profile'
    })
    // res.sendFile(path.join(__dirname, '../../views', 'profile.html'));
})

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

router.get('/admin', verifyAdminSession, (req, res) => {
    res.render('admin', {
        title: 'Admin Panel'
    })
});

module.exports = router;