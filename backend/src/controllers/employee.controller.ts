import { Request, Response } from "express";
import Employee, { IEmployee } from "../models/Employee";
import { sendEmail } from "../utils/sendEmail";
import bcrypt from 'bcrypt';
import User from "../models/User";


export const createEmployee = async (req: Request, res: Response) => {
  try {
    const {
      email,
      first_name,
      last_name,
      role,
      position,
      department,
      status,
      salary,
      date_hired,
      created_by,
      update_by,
    } = req.body;

    if (!email || !first_name || !last_name || !role || !department || !created_by || !update_by) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists." });
    }

    // 2. Create a new user (this is the employee account)
    const hiredDate = new Date(date_hired).toISOString().split("T")[0];
    const tempPassword = `${first_name.toLowerCase()}${last_name.toLowerCase()}${hiredDate}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await User.create({
      email,
      username: email,
      password: hashedPassword,
      first_name,
      last_name,
      role: "user",
    });

    const newEmployee = await Employee.create({
      user: user._id, 
      first_name,
      last_name,
      role,
      position,
      department,
      status: status || "active",
      salary: salary || 0,
      date_hired,
      password: hashedPassword,
      created_by,
      update_by,
      sent_email: true,
    });
    

    // 4. Send invitation email
    const subject = "You're invited to the system";
    const html = `
      <p>Hello <strong>${first_name} ${last_name}</strong>,</p>
      <p>You’ve been added to the system.</p>
      <p><strong>Login Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      <p>Please change your password after logging in.</p>
    `;
    await sendEmail(email, subject, html);

    res.status(201).json({ message: "Employee created and invite sent", employeeId: newEmployee._id });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ message: "Failed to create employee", error });
  }
};


// Get All Employees
export const getAllEmployees = async (_req: Request, res: Response) => {
  try {
    const employees = await Employee.find()
      .populate("user")
      .populate("role", "name"); 

    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
};




// Get Single Employee
export const getEmployee = async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findById(req.params.id)
    .populate("user", "-password")
    .populate("role",'name');
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    res.status(200).json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ message: "Failed to fetch employee" });
  }
}

// Update Employee
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Employee not found" });

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Failed to update employee" });
  }
}

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Cast deleted to IEmployee so .user won't throw TS error
    const deleted = await Employee.findByIdAndDelete(id) as IEmployee | null;

    if (!deleted) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Delete the associated user
    if (deleted.user) {
      await User.findByIdAndDelete(deleted.user);
    }

    res.status(200).json({ message: "Employee and associated user deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: "Failed to delete employee" });
  }
};
