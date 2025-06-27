import express from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employee.controller";

const router = express.Router();

router.post("/create-employee", createEmployee);
router.get("/get-all-employees", getAllEmployees);
router.get("/get-detailed/:id", getEmployee);
router.put("/update-employee/:id", updateEmployee);
router.delete("/delete-employee/:id", deleteEmployee);

export default router;
