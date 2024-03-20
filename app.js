const https = require('https');
const fs = require('fs');
const express = require('express');
const app = express();

// Path to your certificate and private key
const options = {
  key: fs.readFileSync('./test_certs/server.key'),
  cert: fs.readFileSync('./test_certs/server.crt'),
  passphrase: 'passphrase'
};

const { verifySession } = require('./src/controllers/session.controller');

async function startServer() {
	require('dotenv').config();
	const express = require('express');
	// const multer = require('multer'); // For handling file uploads (tentative)
	const bcrypt = require('bcrypt'); // For hashing passwords
	const rateLimit = require('express-rate-limit'); // For rate-limiting to prevent brute-forcing
	const router = require('./src/routes/router');
	const userRouter = require('./src/routes/user.router');
	const session = require('express-session');
	const bodyParser = require('body-parser')
	const exphbs = require('express-handlebars')

	// const app = express();
	const port = process.env.PORT;

	// Serve static files from the 'public' directory
	app.use('/static', express.static('public'));

	// use handlebars
    app.engine("hbs", exphbs.engine({
        extname: "hbs"
    }));
    app.set("view engine", "hbs");
    app.set("views", "./views");
    app.set("view cache", false);

	// Parse URL-encoded bodies (as sent by HTML forms)
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json())


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

	app.use(redirectUnmatched);

	// app.listen(port, () => console.log(`App listening at http://localhost:${port}`));

}

function redirectUnmatched(req, res) {
	res.redirect("/");
}

startServer();

// Create an HTTPS server
https.createServer(options, app).listen(443, () => {
	console.log('HTTPS server running on port 443');
	console.log('https://localhost/');
  });