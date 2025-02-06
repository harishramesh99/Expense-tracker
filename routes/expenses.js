
import express from 'express';
import Expense from '../models/Expense.js';

const router = express.Router();

router.get("/dashboard", async (req, res) => {
  const expenses = await Expense.find().sort({ date: -1 });
  res.render("dashboard", { expenses });
});


router.get("/summary", async (req, res) => {
  const expenses = await Expense.find();
  res.render("summary", { expenses });
});


router.post("/add-expenses", async (req, res) => {
  const { description, amount, category } = req.body;
  await new Expense({ description, amount, category }).save();
  res.redirect("/expenses/dashboard");
});


router.delete("/delete/:id", async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.redirect("/expenses/dashboard");
});




export default router;
