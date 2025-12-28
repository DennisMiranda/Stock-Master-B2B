import { Request, Response, NextFunction } from "express";
import { db } from "../../config/firebase.js";

export const UserDocCheck = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.uid;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User ID not found" });
    }
    // verificamos que el uid y el docID coincidan
    const userDoc = await db.collection("orders").doc(userId).get();
    
    if (!userDoc.exists) {
        return res.status(404).json({ message: "Document not found for the user" });
    }
    const fireUid = userDoc.data()?.userId;
    if (fireUid !== userId) {
        return res.status(403).json({ message: "Forbidden: User ID does not match document" });
    }
    next();
};