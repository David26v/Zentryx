// routes/role.routes.ts
import express from "express";
import {
  createRole,
  getAllRoles,
  getRole,
  updateRole,
  deleteRole,
} from "../controllers/role.controller";

const router = express.Router();

router.post("/create-role", createRole);
router.get("/get-all-role", getAllRoles);
router.get("/get-role/:id", getRole);
router.put("/update-role/:id", updateRole);
router.delete("/delete-role/:id", deleteRole);

export default router;
