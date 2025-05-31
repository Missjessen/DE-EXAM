// src/routes/authRoutes.ts
import express from 'express'
import { googleLogin, googleCallback, getMe, logout } from '../controllers/googleAuthController'

import { loginLimiter } from '../middleware/rateLimiter'
import { authMiddleware } from '@missjessen/mdb-rest-api-core';

// █████████████████████████████████████████████████
// █           Google Login ROUTES (CRUD)          █
// █████████████████████████████████████████████████


const authRouter = express.Router()




authRouter.get('/google', loginLimiter, googleLogin)


authRouter.get('/google/callback', googleCallback)


authRouter.get('/google', loginLimiter, googleLogin);


authRouter.get('/me', authMiddleware(), getMe)


authRouter.post('/logout', authMiddleware(), logout)

export default authRouter
