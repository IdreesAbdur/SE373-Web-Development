import express from "express";
import Employee from "../models/Employee.js";

const router = express.Router();

/**
 * HOME / INDEX PAGE
 * Shows the form
 */
router.get(["/", "/index"], (req, res) => {
  res.render("index", {
    title: "Employee Management",
    departments: ["IT", "HR", "Sales"], 
  });
});

/**
 * CREATE/SUBMIT
 */
router.post("/employees/create", async (req, res) => {
  try {
    const { firstName, lastName, department, startDate, jobTitle, salary } =
      req.body;

    await Employee.create({
      firstName,
      lastName,
      department,
      startDate,
      jobTitle,
      salary: Number(salary),
    });

    res.redirect("/employees");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/**
 * READ / VIEW all employees (table)
 */
router.get("/employees", async (req, res) => {
    try {
      const employees = await Employee.find().sort({ createdAt: -1 }).lean();
  
      const formatted = employees.map((e) => ({
        ...e,
        startDateDisplay: new Date(e.startDate).toLocaleDateString(),
        startDateValue: new Date(e.startDate).toISOString().slice(0, 10),
      }));
  
      res.render("view", { title: "Employees", employees: formatted });
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  

/**
 * UPDATE page 
 */
router.get("/employees/:id/edit", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).lean();
    if (!employee) return res.status(404).send("Employee not found");

    res.render("update", {
      title: "Update Employee",
      employee,
      departments: ["IT", "HR", "Sales"],
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});


router.post("/employees/:id/update", async (req, res) => {
  try {
    const { firstName, lastName, department, startDate, jobTitle, salary } =
      req.body;

    await Employee.findByIdAndUpdate(req.params.id, {
      firstName,
      lastName,
      department,
      startDate,
      jobTitle,
      salary: Number(salary),
    });

    // will direct back to list after update
    res.redirect("/employees");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/**
 * DELETE --> display message page with h2
 */
router.post("/employees/:id/delete", async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.render("delete", {
      title: "Deleted",
      message: "Employee deleted successfully.",
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;
