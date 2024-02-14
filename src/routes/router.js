const Router = require('express').Router;
const path = require('path');

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

// TODO: Move login and register to separate router and controller
router.post('/api/login', async (req, res) => {
    // Placeholder for user retrieval logic from database

    // Check if user exists and password is correct
    // const user = /* logic to get user from DB */;
    const validPassword = await bcrypt.compare(req.body.password, user.passwordHash);

    if (user && validPassword) {
        // Session logic stuff here (let's use express-session IDK how to do that shit tho)
        // Redirect to user profile or admin panel
    } else {
        res.send('Login failed!');
    }
});

router.post('/api/register', /* upload.single('profilePhoto'), */ async (req, res) => {
    try {
        // We finna validate input fields here (e.g. validator library for email and phone number)
        // Placeholder for validation logic

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Save user to database
        // Placeholder for database logic

        res.redirect('/login'); // Redirect to login page after successful registration
    } catch {
        res.redirect('/register'); // On error, redirect back to registration
    }
});

// Logout Endpoint
router.post('/logout', (req, res) => {
    // Logout logic here (terminate session and shit)
    res.redirect('/login'); // Redirect to login
});

router.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views', 'admin.html'));
});

module.exports = router;