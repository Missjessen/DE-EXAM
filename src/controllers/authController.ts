import { 
    type Request, 
    type Response, 
    type NextFunction 
} from "express";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Joi, { ValidationResult } from "joi";

import { userModel } from "../models/userModel";
import { User } from "../interfaces/user";
import { connect, disconnect } from "../repository/database";

// ======================== REGISTER USER ========================
/**
 * Register a new user
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns
 */
export async function registerUser(req: Request, res: Response) {

    try {
        // validate the user and password info
        const { error } = validateUserRegistrationInfo(req.body);

        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }

       // await connect();

        // check if the email is already registered
        const emailExists = await userModel.findOne({ email: req.body.email });

        if (emailExists) {
            res.status(400).json({ error: "Email already exists." });
            return;
        }

        // check if the email is already registered


        // has the password
        const salt = await bcrypt.genSalt(10);
        const passwordHashed = await bcrypt.hash(req.body.password, salt);

        // create a user object and save in the DB
        const userObject = new userModel({
            name: req.body.name,
            email: req.body.email,
            password: passwordHashed
        });

        const savedUser = await userObject.save();
        res.status(201).json({ error: null, data: savedUser._id });

    } catch (error) {
        res.status(500).send({ error: `Error registrering user. Error`});
    }
    // finally {
    //    // await disconnect();
    // }
};

// ======================== LOGIN USER ========================
/**
 * Login a user
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns
 */

export async function loginUser(req: Request, res: Response) {
    try {
        // validate the user and password information
        const { error } = validateUserLoginInfo(req.body);

        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }

        // find the user
        //await connect();
        const user: User | null = await userModel.findOne({ email: req.body.email });
        if (!user) {
            res.status(400).json({ error: "Email or password is incorrect" });
            return;
        }

        else {
            // check auth token and return
            const validhashedPassword: boolean = await bcrypt.compare(req.body.password, user.password);
            if (!validhashedPassword) {
                res.status(400).json({ error: "Email or password is incorrect" });
                return;
            }

            const userId: string = user.id.toString(); // Konverter ObjectId til string
            const token: string = jwt.sign(
                { 
                    name: user.name,
                    email: user.email,
                    id: userId,
                },
                process.env.TOKEN_SECRET as string,
                { expiresIn: '2h' } // Rigtigt placeret
            );

            // Add token to the header and send response
            res.status(200).header("auth-token", token).json({ error: null, data: { userId, token } });
        }

    } catch (error) {
        res.status(500).send({ error: "Error logging in user." });
    }
    //  finally {
    //     await disconnect();
     
}
/**
 * Validate user info (name, email, password)
 * @param data
 */
export function validateUserRegistrationInfo(data: User): ValidationResult {

    // define the schema
    const schema = Joi.object({
        name: Joi.string().min(3).max(255).required(),
        email: Joi.string().email().min(6).max(255).required(),
        password: Joi.string().min(6).max(30).required(),
    });

    return schema.validate(data);
}



// ======================== VALIDATION FUNCTIONS ========================
/**
 * Validate user registration info
 * @param data - User data object
 */
export function validateUserLoginInfo(data: User): ValidationResult {

    // define the schema
    const schema = Joi.object({
        
        email: Joi.string().email().min(6).max(255).required(),
        password: Joi.string().min(6).max(30).required()
    });

    return schema.validate(data);
}



// ======================== TOKEN VERIFICATION ========================
/**
 * Middleware to verify the token
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next function
 */

export function verifyToken(req: Request, res: Response, next: NextFunction) {
    const token = req.header("auth-token");

    if (!token) {
         res.status(401).json({ error: "Access Denied" });
            return;
    }

    try {
        
        if (token) 
            jwt.verify(token, process.env.TOKEN_SECRET as string);
            next();
           }
        catch {
        res.status(400).send("Invalid Token");
    }
}

