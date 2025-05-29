import { Router, Request, Response } from 'express';
import { startCron } from './controllers/devToolsController';
import { loginUser, registerUser, verifyToken } from './controllers/authController'; 

const router: Router = Router();

/* 
█████████████████████████████████████████████████                                           
█          🌐 Render alive                      █                                            
█████████████████████████████████████████████████
*/
//router.get('/ping', startCron);
/**
 * @swagger
 * /start-cron:
 *   get:
 *     tags:
 *       - Start Cron Jobs
 *     summary: Starts the cron job that keep render alive
 *     description: Starts the cron job that keep render alive
 *     responses:
 *       200:
 *         description: Response from the cron job
 *         content:
 *           application/json:
 *             schema:
 *               type: array               
 */
router.get('/start-cron', startCron);


// ░▒▓██ get, post, put, delete (CRUD)██▓▒░

/* 
█████████████████████████████████████████████████                                           
█          🌐 API ROUTES CONFIGURATION          █                                            
█████████████████████████████████████████████████
*/


router.get('/', (req: Request, res: Response) => {
    res.status(200).send({message:'Welcome to the THIS API'});
});

/* 
█████████████████████████████████████████████████
█             🔐 AUTHENTICATION ROUTES          █
█████████████████████████████████████████████████
*/
/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     description: Takes a user in the body and tries to register it in the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/User"
 *           example:
 *             name: "homer_simpson"
 *             email: "homer.simpson@springfield.com"
 *             password: "donuts4life"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 _id:
 *                   type: string
 */
router.post('/user/register', registerUser );


/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login an existing user
 *     description: Logs in an existing user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "homer@springfield.com"
 *               password:
 *                 type: string
 *                 example: "DonutLover123"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid email or password"
 */
router.post('/user/login', loginUser );




export default router;
