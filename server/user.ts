import { Request, Response } from "express";

let currentUsers: { [user: string]: string } = {};

export const updateStatus = (req: Request, res: Response) => {
    try {
        const editor = req.body.name;
        const filename = req.body.filename;
        currentUsers[editor] = filename;
    } catch {
        res.sendStatus(400);
    }
    res.send(currentUsers);
};
