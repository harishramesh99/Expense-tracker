import express from 'express';
import Expense from '../models/Expense.js';

const router = express.Router();

router.get("/dashboard", async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 });
        res.render("dashboard", { expenses });
    } catch (err) {
        console.error('Dashboard route error:', err);
        res.status(500).render('error', { message: 'Error loading dashboard' });
    }
});

router.get("/summary", async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.render("/summary", { expenses });
    } catch (err) {
        console.error('Summary route error:', err);
        res.status(500).render('error', { message: 'Error loading summary' });
    }
});


router.get("/add-expenses", (req, res) => {
    try{
        res.render("add-expenses");
    }
    catch(err){
        console.error('Add expenses route error:', err);
        res.status(500).render('error', { message: 'Error loading add expenses' });
    }
    
});

router.post("/add-expenses", async (req, res) => {
    try {
        const { description, amount, category } = req.body;
        await new Expense({ description, amount, category }).save();
        console.log("Expense added successfully");
        res.redirect("/dashboard");
    } catch (err) {
        console.error('Add expense error:', err);
        res.status(500).render('error', { message: 'Error adding expense' });
    }
});



router.post("/delete-expense/:id", async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.redirect("/dashboard");
    } catch (err) {
        console.error('Delete expense error:', err);
        res.status(500).render('error', { message: 'Error deleting expense' });
    }
});

router.get("/edit/:id", async (req, res) => {
    try {
        const [expense, allExpenses] = await Promise.all([
            Expense.findById(req.params.id),
            Expense.find().sort({ date: -1 })
        ]);
        
        res.render('dashboard', { 
            expenses: allExpenses,
            editMode: true,
            editExpense: expense
        });
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
 });


 router.post("/edit-expense/:id", async (req, res) => {
    try {
        const { description, amount, category } = req.body;
        await Expense.findByIdAndUpdate(req.params.id, {
            description,
            amount: Number(amount),
            category
        });
        res.redirect("/dashboard");
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
 });


export default router;
