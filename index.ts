import express, { Application, Request, Response } from "express"
import cors from "cors"
import auth from "./router/authRouter"
import { myConnection } from "./utils/connection";

const app:Application= express()
const port = 4444;

app.set("view engine", "ejs")
app.use(cors())
app.use(express.json())

app.get("/", (req:Request, res:Response) => {
    try {
        return res.status(200).json({
            message:"Awesome"
        })
    } catch (error:any) {
        console.log("error from index")
    }
})
app.use("/api", auth)

myConnection("gets")

app.listen(port,()=>{
    console.log("")
    console.log("auth server listening on port", port)
})