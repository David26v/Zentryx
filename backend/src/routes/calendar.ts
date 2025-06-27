import express from "express";
import { createEvent, deleteEvent, getEventById, getEvents, updateEvent } from "../controllers/calendar.controller";


const router = express.Router();

router.post("/create-event", createEvent);
router.get("/get-event", getEvents);
router.get("/:id", getEventById);
router.put("/update-event/:id", updateEvent);
router.delete("/delete-event/:id", deleteEvent);

export default router;
