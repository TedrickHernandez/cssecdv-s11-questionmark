async function startServer() {
	const dotenv = require('dotenv').config()
	const express = require('express');
	// const multer = require('multer'); // For handling file uploads (tentative)
	const bcrypt = require('bcrypt'); // For hashing passwords
	const rateLimit = require('express-rate-limit'); // For rate-limiting to prevent brute-forcing

	const path = require('path');
	const app = express();
	const port = process.env.PORT;

	// Serve static files from the 'public' directory
	app.use(express.static('public'));
	// Parse URL-encoded bodies (as sent by HTML forms)
	app.use(express.urlencoded({ extended: true }));
	// Parse JSON bodies
	app.use(express.json());

	// Rate Limiting to Prevent Brute-Force Attacks
	const loginLimiter = rateLimit({
		windowMs: process.env.RATE_LIMIT * 60 * 1000, // 15 minutes (for now)
		max: process.env.NUM_ATTEMPTS, // Limit each IP to 100 login requests per windowMs
		message: "Bruh, too many login attempts from this IP. Chillax."
	});
	app.use('/login', loginLimiter);

	// Registration Endpoint
	app.post('/register', /* upload.single('profilePhoto'), */ async (req, res) => {
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

	// Login Endpoint
	app.post('/login', async (req, res) => {
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

	// Logout Endpoint
	app.post('/logout', (req, res) => {
		// Logout logic here (terminate session and shit)
		res.redirect('/login'); // Redirect to login
	});

	app.get('/', (req, res) => res.send("What's up, dawg? Go to /register, /login, or /admin."));
	app.get('/register', (req, res) => {
		res.sendFile(path.join(__dirname, 'views', 'registration.html'));
	});
	app.get('/login', (req, res) => {
		res.sendFile(path.join(__dirname, 'views', 'login.html'));
	});
	app.get('/admin', (req, res) => {
		res.sendFile(path.join(__dirname, 'views', 'admin.html'));
	});

	app.listen(port, () => console.log(`App listening at http://localhost:${port}`));

}

startServer();