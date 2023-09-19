import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { sendAccountOpeningMail } from "../utils/email";

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { userName, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const value = crypto.randomBytes(32).toString("hex");
    const token = jwt.sign(value, "mySecert");

    const user = await prisma.authModel.create({
      data: {
        userName,
        password: hash,
        email,
        token,
        store: []
      },
    });

    // sendAccountOpeningMail(user).then(()=>{
    //     console.log("mail SendmailTransport.....")
    // })

    return res.status(201).json({
      message: "Account created successfully",
      data: user,
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const signInUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.authModel.findUnique({
      where: { email },
    });
    if (user) {
      const check = await bcrypt.compare(password, user.password);
      if (check) {
        if (user.verified && user.token === "") {
          const token = jwt.sign({ id: user.id }, "hello", { expiresIn: "1d" });

          req.headers.authorization= `Bearer ${token}`;

          return res.status(201).json({
            message: "Account created successfully",
            data: token,
          });
        }
      } else {
        return res.status(400).json({ message: "invalid password" });
      }
    } else {
      return res.status(400).json({ message: "user not found" });
    }
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const verifiedUser = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;

    const user = await prisma.authModel.findUnique({
      where: { id: userID },
    });

    if (user?.token !== "") {
      const userData = await prisma.authModel.update({
        where: { id: user?.id },
        data: {
          verified: true,
          token: "",
        },
      });
      return res.status(200).json({
        message: "Account created successfully",
        data: userData,
      });
    } else {
      return res.status(400).json({ message: "user not found" });
    }
  } catch (error:any) {
    return res.status(400).json({ message: error.message });
  }
};

export const viewAllUsers = async (req: Request, res: Response) => {
  try {
    const user = await prisma.authModel.findMany({});

    return res.status(200).json({
      message: "All users found",
      data: user,
    });
  } catch (error:any) {
    return res.status(400).json({ message: error.message });
  }
};
export const viewOneUsers = async (req: Request, res: Response) => {
  try {
    const {userID}=req.params
    const user = await prisma.authModel.findUnique({
        where:{
            id: userID
        }
    });

    return res.status(200).json({
      message: "single users found",
      data: user,
    });
  } catch (error:any) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async(req:Request, res:Response)=>{
    try {
        const {userID}= req.params

        const user= await prisma.authModel.delete({
            where:{
                id: userID,
            }
        })
        return res.status(200).json({
            message: "user deleted successfully",
            data: user
        })
    } catch (error:any) {
        return res.status(404).json({ message: error.message });
    }
}