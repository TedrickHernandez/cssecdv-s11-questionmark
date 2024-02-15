const Router = require('express').Router;
const path = require('path');
const { removeSession, verifyAdminSession } = require('../controllers/session.controller');

const router = Router();

router.get('/', (req, res) => {
    res.redirect('/login');
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views', 'login.html'));
});

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views', 'registration.html'));
})

// Logout Endpoint
router.post('/logout', removeSession, (req, res) => {
    res.redirect('/login'); // Redirect to login
});

router.get('/admin', verifyAdminSession, (req, res) => {
    res.sendFile(path.join(__dirname, '../../views', 'admin.html'));
});

module.exports = router;