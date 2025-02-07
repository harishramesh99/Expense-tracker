// import express from 'express';
// import Expense from '../models/Expense.js';

// const router = express.Router();



// router.get("/dashboard", isAuthenticated, async (req, res) => {
//     try {
//         const expenses = await Expense.find().sort({ date: -1 });
//         res.render("dashboard", { expenses });
//     } catch (err) {
//         console.error('Dashboard route error:', err);
//         res.status(500).render('error', { message: 'Error loading dashboard' });
//     }
// });

// router.get("/summary", async (req, res) => {
//     try {
//         const expenses = await Expense.find();
//         res.render("/summary", { expenses });
//     } catch (err) {
//         console.error('Summary route error:', err);
//         res.status(500).render('error', { message: 'Error loading summary' });
//     }
// });


// router.get("/add-expenses", (req, res) => {
//     try{
//         res.render("add-expenses");
//     }
//     catch(err){
//         console.error('Add expenses route error:', err);
//         res.status(500).render('error', { message: 'Error loading add expenses' });
//     }
    
// });

// router.post("/add-expenses", async (req, res) => {
//     try {
//         const { description, amount, category } = req.body;
//         await new Expense({ description, amount, category }).save();
//         console.log("Expense added successfully");
//         res.redirect("/dashboard");
//     } catch (err) {
//         console.error('Add expense error:', err);
//         res.status(500).render('error', { message: 'Error adding expense' });
//     }
// });



// router.post("/delete-expense/:id", async (req, res) => {
//     try {
//         await Expense.findByIdAndDelete(req.params.id);
//         res.redirect("/dashboard");
//     } catch (err) {
//         console.error('Delete expense error:', err);
//         res.status(500).render('error', { message: 'Error deleting expense' });
//     }
// });

// router.get("/edit/:id", async (req, res) => {
//     try {
//         const [expense, allExpenses] = await Promise.all([
//             Expense.findById(req.params.id),
//             Expense.find().sort({ date: -1 })
//         ]);
        
//         res.render('dashboard', { 
//             expenses: allExpenses,
//             editMode: true,
//             editExpense: expense
//         });
//     } catch (err) {
//         res.status(500).render('error', { message: err.message });
//     }
//  });


//  router.post("/edit-expense/:id", async (req, res) => {
//     try {
//         const { description, amount, category } = req.body;
//         await Expense.findByIdAndUpdate(req.params.id, {
//             description,
//             amount: Number(amount),
//             category
//         });
//         res.redirect("/dashboard");
//     } catch (err) {
//         res.status(500).render('error', { message: err.message });
//     }
//  });


// export default router;

import express from 'express';
import Expense from '../models/Expense.js';
import requireAuth from '../helpers/authh.js';

const router = express.Router();

router.get("/dashboard",requireAuth,  async (req, res) => {
    try {
        // Fetch only the expenses of the logged-in user from session
        const expenses = await Expense.find({ user: req.session.userId }).sort({ date: -1 });
        res.render("dashboard", { expenses:expenses, userId: req.session.userId });
    } catch (err) {
        console.error('Dashboard route error:', err);
        res.status(500).render('error', { message: 'Error loading dashboard' });
    }
});

router.get("/summary",requireAuth, async (req, res) => {
    try {
        // Fetch only the expenses of the logged-in user from session
        const expenses = await Expense.find({ user: req.session.userId });
        res.render("summary", { expenses });
    } catch (err) {
        console.error('Summary route error:', err);
        res.status(500).render('error', { message: 'Error loading summary' });
    }
});

router.get("/add-expenses",requireAuth, (req, res) => {
    try {
        res.render("add-expenses");
    } catch (err) {
        console.error('Add expenses route error:', err);
        res.status(500).render('error', { message: 'Error loading add expenses' });
    }
});

router.post("/add-expenses", requireAuth,async (req, res) => {
    try {
        const { description, amount, category } = req.body;

        // Create a new expense and link it to the logged-in user using session
        const newExpense = new Expense({
            description,
            amount,
            category,
            user: req.session.userId // Link to the logged-in user
        });

        await newExpense.save();
        console.log("Expense added successfully");
        res.redirect("/dashboard");
    } catch (err) {
        console.error('Add expense error:', err);
        res.status(500).render('error', { message: 'Error adding expense' });
    }
});

router.post("/delete-expense/:id",requireAuth, async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        // Ensure the logged-in user is the owner of the expense using session
        if (expense.user.toString() !== req.session.userId.toString()) {
            return res.status(403).render('error', { message: 'Unauthorized to delete this expense' });
        }

        await Expense.findByIdAndDelete(req.params.id);
        res.redirect("/dashboard");
    } catch (err) {
        console.error('Delete expense error:', err);
        res.status(500).render('error', { message: 'Error deleting expense' });
    }
});

router.get("/edit/:id", requireAuth,async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        // Ensure the logged-in user is the owner of the expense using session
        if (expense.user.toString() !== req.session.userId.toString()) {
            return res.status(403).render('error', { message: 'Unauthorized to edit this expense' });
        }

        const allExpenses = await Expense.find({ user: req.session.userId }).sort({ date: -1 });
        res.render('dashboard', {
            expenses: allExpenses,
            editMode: true,
            editExpense: expense
        });
    } catch (err) {
        console.error('Edit expense error:', err);
        res.status(500).render('error', { message: 'Error loading edit expense' });
    }
});

router.post("/edit-expense/:id",requireAuth, async (req, res) => {
    try {
        const { description, amount, category } = req.body;
        const expense = await Expense.findById(req.params.id);

        // Ensure the logged-in user is the owner of the expense using session
        if (expense.user.toString() !== req.session.userId.toString()) {
            return res.status(403).render('error', { message: 'Unauthorized to edit this expense' });
        }

        // Update the expense
        await Expense.findByIdAndUpdate(req.params.id, {
            description,
            amount: Number(amount),
            category
        });
        res.redirect("/dashboard");
    } catch (err) {
        console.error('Edit expense error:', err);
        res.status(500).render('error', { message: 'Error updating expense' });
    }
});

router.get("/monthly-summary",requireAuth, async (req, res) => {
    try {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // Get current month (1-12)

        // Ensure the session contains userId before proceeding
        if (!req.session.userId) {
            console.log(req.session.userId, "id ayo ya ");
            return res.status(401).render('error', { message: 'User is not authenticated' });
        }
            console.log(req.session.userId, "id ayo ya ");
            console.log("chalyo")
        // Find all expenses for the current user in the current month
        const monthlyExpenses = await Expense.find({
            user: req.session.userId,  // Ensure userId is in correct format
            date: {
                $gte: new Date(year, month - 1, 1),  // Start of the month
                $lt: new Date(year, month, 1)         // End of the month
            }
        });

        // If no expenses found, render message
        if (monthlyExpenses.length === 0) {
            return res.render('monthly-summary', { message: 'No data available for this month' });
        }

        // Calculate the total amount of expenses for the current month
        const grandTotal = monthlyExpenses.reduce((total, expense) => total + expense.amount, 0).toFixed(2);
        console.log(grandTotal, "grandTotal");

        // Format the expense data to include the formatted total amount
        const formattedExpenses = monthlyExpenses.map(expense => ({
            ...expense.toObject(),
            amount: expense.amount.toFixed(2) // Format amount to two decimal places
        }));

        // Render the monthly-summary page with the data
        res.render("monthly-summary", { 
            userId: req.session.userId,
            monthlyExpenses: formattedExpenses, 
            grandTotal,
            month,
            year
        });
    } catch (err) {
        console.error('Monthly summary route error:', err);
        res.status(500).render('error', { message: 'Error loading monthly summary' });
    }
});



router.get("/yearly-summary",requireAuth, async (req, res) => {
    try {
        const currentDate = new Date();
        const year = currentDate.getFullYear(); // Get current year

        // Ensure the session contains userId before proceeding
        if (!req.session.userId) {
            console.log(req.session.userId, "id ayo ya ");
            return res.status(401).render('error', { message: 'User is not authenticated' });
        }
        console.log(req.session.userId, "id ayo ya ");
        console.log("chalyo");

        // Find all expenses for the current user in the current year
        const yearlyExpenses = await Expense.find({
            user: req.session.userId,  // Ensure userId is in correct format
            date: {
                $gte: new Date(year, 0, 1),   // Start of the year
                $lt: new Date(year + 1, 0, 1)  // Start of the next year
            }
        });

        // If no expenses found, render message
        if (yearlyExpenses.length === 0) {
            return res.render('yearly-summary', { message: 'No data available for this year' });
        }

        // Calculate the total amount of expenses for the current year
        const grandTotal = yearlyExpenses.reduce((total, expense) => total + expense.amount, 0).toFixed(2);
        console.log(grandTotal, "grandTotal");

        // Format the expense data to include the formatted total amount
        const formattedExpenses = yearlyExpenses.map(expense => ({
            ...expense.toObject(),
            amount: expense.amount.toFixed(2) // Format amount to two decimal places
        }));

        // Render the yearly-summary page with the data
        res.render("yearly-summary", { 
            userId: req.session.userId,
            yearlyExpenses: formattedExpenses, 
            grandTotal,
            year
        });
    } catch (err) {
        console.error('Yearly summary route error:', err);
        res.status(500).render('error', { message: 'Error loading yearly summary' });
    }
});


export default router;
