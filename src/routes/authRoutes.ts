// src/routes/authRoutes.ts
import express from 'express'
import { googleLogin, googleCallback, getMe, logout } from '../controllers/googleAuthController'
import { requireAuth } from '../middleware/requireAuth'
import { loginLimiter } from '../middleware/rateLimiter'


// █████████████████████████████████████████████████
// █           Google Login ROUTES (CRUD)          █
// █████████████████████████████████████████████████


const authRouter = express.Router()




authRouter.get('/google', loginLimiter, googleLogin)


authRouter.get('/google/callback', googleCallback)


authRouter.get('/google', loginLimiter, googleLogin);


authRouter.get('/me', requireAuth, getMe)


authRouter.post('/logout', logout)

export default authRouter
