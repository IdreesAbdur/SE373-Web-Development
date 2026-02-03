import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    jobTitle: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
