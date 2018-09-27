import UserService from "../services/UserService";
import * as express from 'express';
import { Request, Response } from 'express';

/**
*   User Router
*   Requests from : '/'
*/

class UserRouter {
    constructor(private userService: UserService) {
        this.userService = userService;
    }

    private isValidPassword = (pass: string) => {
        return pass.length >= 8 && pass.length <= 64;
    }

    private isValidEmail = (email: string) => {
        return (/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
            .test(email);
    }

    getRouter = () => {
        const router = express.Router();
        router.post('/signin', this.onUserSignIn);
        router.post('/signup', this.onUserSignUp);
        router.get('/profile/:id', this.handleUserProfile);
        router.put('/image', this.handleImage);
        return router;
    }

    onUserSignUp = async (req: Request, res: Response) => {
        const { name, email, password } = req.body;
        if (name &&
            this.isValidEmail(email) &&
            this.isValidPassword(password)) {
            try {
                const user = await this.userService.onUserSignUp(name, email, password);
                return res.json(user);
            }
            catch (err) {
                return res.status(404).json(err);
            }
        } else {
            return res.status(400).json('Please provide a valid credentials');
        }
    }

    onUserSignIn = async (req: Request, res: Response) => {
        const { email, password } = req.body;
        if (email && password) {
            try {
                const user = await this.userService.onUserSignIn(email, password);
                return res.json(user);
            }
            catch (err) {
                return res.status(404).json(err);
            }
        } else {
            return res.status(400).json('Please provide a valid credentials');
        }
    }

    handleUserProfile = async (req: Request, res: Response) => {
        try {
            const users = await this.userService.findUsersById(req.params.id);
            return res.json(users[0]);
        }
        catch (err) {
            return res.status(404).json(err);
        }
    }
    handleImage = async (req: Request, res: Response) => {
        const { id } = req.body;
        try {
            const entries = await this.userService.incrementUserEntries(id);
            return res.json(entries);
        }
        catch (err) {
            return res.status(404).json(err);
        }
    }
}

export default UserRouter;