import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  category: String,
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Expense", ExpenseSchema);
