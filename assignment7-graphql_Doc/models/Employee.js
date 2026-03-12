import mongoose from "mongoose";

// Define the Employee schema EXACTLY as required
const employeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  salary: {
    type: Number,
    required: true,
  },
});

// Export model
export default mongoose.model("Employee", employeeSchema);