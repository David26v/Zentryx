import { Request, Response } from "express";
import CalendarEvent, { ICalendarEvent } from "../models/Calendar";

// Create a new calendar event
export const createEvent = async (req: Request, res: Response) => {
  try {
    const eventData: ICalendarEvent = req.body;
    const newEvent = new CalendarEvent(eventData);
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: "Failed to create event", error });
  }
};

// Get all events
export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await CalendarEvent.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events", error });
  }
};

// Get a single event by ID
export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await CalendarEvent.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event", error });
  }
};

// Update an event by ID
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const eventData: Partial<ICalendarEvent> = req.body;
    const updatedEvent = await CalendarEvent.findByIdAndUpdate(id, eventData, { new: true });
    if (!updatedEvent) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: "Failed to update event", error });
  }
};

// Delete an event by ID
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedEvent = await CalendarEvent.findByIdAndDelete(id);
    if (!deletedEvent) return res.status(404).json({ message: "Event not found" });
    res.status(200).json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event", error });
  }
};
