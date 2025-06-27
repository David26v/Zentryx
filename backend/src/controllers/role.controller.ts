import { Request, Response } from "express";
import Role from "../models/Role";

// Create new role
export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    const existing = await Role.findOne({ name });
    if (existing) return res.status(409).json({ message: "Role already exists." });

    const role = new Role({ name, description });
    await role.save();

    res.status(201).json({ message: "Role created successfully", role });
  } catch (err) {
    console.error("Error creating role:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all roles
export const getAllRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });
    res.status(200).json({ roles });
  } catch (err) {
    console.error("Error fetching roles:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single role
export const getRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    res.status(200).json({ role });
  } catch (err) {
    console.error("Error fetching role:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update role
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const role = await Role.findById(id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    role.name = name ?? role.name;
    role.description = description ?? role.description;
    await role.save();

    res.status(200).json({ message: "Role updated", role });
  } catch (err) {
    console.error("Error updating role:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete role
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await Role.findByIdAndDelete(id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    res.status(200).json({ message: "Role deleted successfully" });
  } catch (err) {
    console.error("Error deleting role:", err);
    res.status(500).json({ message: "Server error" });
  }
};