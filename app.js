const { verifySession } = require('./src/controllers/session.controller');

async function startServer() {
	require('dotenv/config');
	const express = require('express');
	// const multer = require('multer'); // For handling file uploads (tentative)
	const bcrypt = require('bcrypt'); // For hashing passwords
	const rateLimit = require('express-rate-limit'); // For rate-limiting to prevent brute-forcing
	const router = require('./src/routes/router');
	const userRouter = require('./src/routes/user.router');
	const session = require('express-session');

	const app = express();
	const port = process.env.PORT;

	// Serve static files from the 'public' directory
	app.use('/static', express.static('public'));
	// Parse URL-encoded bodies (as sent by HTML forms)
	app.use(express.urlencoded({ extended: true }));
	// Parse JSON bodies
	app.use(express.json());

	app.use(session({
		secret: '3xTR3m3lY S3cUre 53cR37',
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: 60 * 60 * 1000 // 1 hr (for now)
		}
	}))

	app.use(verifySession)

	// Rate Limiting to Prevent Brute-Force Attacks
	const apiLimiter = rateLimit({
		windowMs: process.env.RATE_LIMIT * 60 * 1000, // 15 minutes (for now)
		max: process.env.NUM_ATTEMPTS, // Limit each IP to 100 login requests per windowMs
		message: "Bruh, too many api calls from this IP. Chillax."
	});

	app.use('/api', apiLimiter);

	app.use(router)
	app.use('/api', userRouter)

	app.listen(port, () => console.log(`App listening at http://localhost:${port}`));

}

startServer();