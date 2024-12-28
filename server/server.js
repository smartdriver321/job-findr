import fs from 'fs'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import cookieParser from 'cookie-parser'
import { auth } from 'express-openid-connect'
import asyncHandler from 'express-async-handler'
dotenv.config()

import connect from './db/connect.js'
import User from './models/UserModel.js'

if (!process.env.CLIENT_URL) {
	throw new Error('CLIENT_URL is not defined in the environment variables')
}

const app = express()

const config = {
	authRequired: false,
	auth0Logout: true,
	secret: process.env.SECRET,
	baseURL: process.env.BASE_URL,
	clientID: process.env.CLIENT_ID,
	issuerBaseURL: process.env.ISSUER_BASE_URL,
	routes: {
		postLogoutRedirect: process.env.CLIENT_URL,
		callback: '/callback',
		logout: '/logout',
		login: '/login',
	},

	session: {
		absoluteDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
		cookie: {
			domain:
				process.env.NODE_ENV === 'development'
					? 'localhost'
					: 'job-findr-ne6k.onrender.com',
			secure: false,
			sameSite: 'None',
		},
	},
}

app.use(
	cors({
		origin: process.env.CLIENT_URL,
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		exposedHeaders: ['set-cookie'],
	})
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(auth(config))
app.use(cookieParser())

// function to check if user exists in the db
const ensureUserInDB = asyncHandler(async (user) => {
	try {
		const existingUser = await User.findOne({ auth0Id: user.sub })

		if (!existingUser) {
			// create a new user document
			const newUser = new User({
				auth0Id: user.sub,
				email: user.email,
				name: user.name,
				role: 'jobseeker',
				profilePicture: user.picture,
			})

			await newUser.save()

			console.log('User added to db', user)
		} else {
			console.log('User already exists in db', existingUser)
		}
	} catch (error) {
		console.log('Error checking or adding user to db', error.message)
	}
})

app.get('/', async (req, res) => {
	if (req.oidc.isAuthenticated()) {
		// check if Auth0 user exists in the db
		await ensureUserInDB(req.oidc.user)

		// redirect to the frontend
		return res.redirect(process.env.CLIENT_URL)
	} else {
		return res.send('Logged out')
	}
})

// routes
const routeFiles = fs.readdirSync('./routes')

routeFiles.forEach((file) => {
	// import dynamic routes
	import(`./routes/${file}`)
		.then((route) => {
			app.use('/api/v1/', route.default)
		})
		.catch((error) => {
			console.log('Error importing route', error)
		})
})

const server = async () => {
	try {
		await connect()

		app.listen(process.env.PORT, () => {
			console.log(`Server is running on port ${process.env.PORT}`)
		})
	} catch (error) {
		console.log('Server error', error.message)
		process.exit(1)
	}
}

server()
