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
    res.sendFile(path.join(__dirname, '../../views', 'login.html'));
});

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views', 'registration.html'));
})

router.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views', 'home.html'));
})

router.post('/register', multer.upload.single('profilePhoto'), usersController.createUser)

// Logout Endpoint
router.post('/logout', removeSession, (req, res) => {
    res.redirect('/login'); // Redirect to login
});

router.get('/admin', verifyAdminSession, (req, res) => {
    res.sendFile(path.join(__dirname, '../../views', 'admin.html'));
});

module.exports = router;
