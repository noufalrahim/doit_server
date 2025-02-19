import { Router, Request } from "express";
import { db } from "../db";
import { NewUser, users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcryptjs from 'bcryptjs';
import jwt from "jsonwebtoken";
import { jwtSecret } from "../secrets";
import { auth, AuthRequest } from "../middleware/auth";

const authRouter = Router();

interface SignupBody {
    name: string,
    password: string,
    email: string,
};

interface LoginBody {
    password: string,
    email: string,
}

authRouter.post("/signup", async (req: Request<{}, {}, SignupBody>, res) => {
    try {
        const {name, email, password} = req.body;
        const existingUser = await db.select().from(users).where(eq(users.email, email));

        if(existingUser.length){
            res.status(400).json({error: "User already exist"});
            return;
        }

        const hashedPassword = await bcryptjs.hash(password, 8);
        
        const newUser: NewUser = {
            name,
            email,
            password: hashedPassword,
        };

        const [user] = await db.insert(users).values(newUser).returning();
        res.status(201).json(user);
        
    }
    catch (e) {
        res.status(500).json({error: e})
    }
});

authRouter.post("/login", async (req: Request<{}, {}, LoginBody>, res) => {
    try {
        const {email, password} = req.body;
        const [existingUser] = await db.select().from(users).where(eq(users.email, email));

        if(!existingUser){
            res.status(400).json({error: "User does not exist"});
            return;
        }

        const isMatch = await bcryptjs.compare(password, existingUser.password);

        if(!isMatch){
            res.status(400).json({error: "Incorrect Password"});
            return;
        }

        const token = jwt.sign({id: existingUser.id}, jwtSecret);
        
        res.json({
            ...existingUser,
            token,
        });
        
    }
    catch (e) {
        res.status(500).json({error: e});
    }
});

authRouter.post("/tokenIsValid", async (req, res) => {
    try{
        const token = req.header("x-auth-token");
        if(!token) {
            res.json(false);
            return;
        }

        const verified = jwt.verify(token, jwtSecret);

        if(!verified){
            res.json(false);
            return;
        };

        const verifiedToken = verified as {id: string};
        const [user] = await db.select().from(users).where(eq(users.id, verifiedToken.id));
        if(!user){ 
            res.json(false);
            return;
        }
        
        res.json(true);
        return;
    }
    catch(e){
        res.status(500).json(false);
    }
});

authRouter.get("/", auth, async (req: AuthRequest, res) => {
    try{
       if(!req.user){
        res.status(401).json({error: "User not found"});
        return;
       }

       const [user] = await db.select().from(users).where(eq(users.id, req.user));
       
       res.json({...user, token: req.token});
    }
    catch(e){
        res.status(500).json({error: e});
    }
});

export default authRouter;