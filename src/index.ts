import express from 'express';
import authRouter from './routes/auth';
import taskRouter from './routes/tasks';
// import { checkConnection } from './db';

const app = express();

app.use(express.json());
app.use("/auth", authRouter);
app.use("/tasks", taskRouter);
// checkConnection();

app.get("/", (req, res) => {
    res.send("Welcome!!!!!!")
})

app.listen(8000, () => {
    console.log("Server started on port 8000");
});