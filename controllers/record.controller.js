const Record = require("../models/Record");

// @desc    Create a new record
// @route   POST /api/records
// @access  Admin
exports.createRecord = async (req, res) => {
  try {
    const { amount, type, category, date, notes } = req.body;
    
    // Basic validation
    if (!amount || !type || !category) {
      return res.status(400).json({ message: "Amount, type, and category are required" });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Type must be income or expense" });
    }

    const newRecord = new Record({
      amount,
      type,
      category,
      date: date || Date.now(),
      notes,
      createdBy: req.user._id
    });

    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Error creating record:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all records with optional filtering
// @route   GET /api/records
// @access  Viewer, Analyst, Admin
exports.getRecords = async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    let query = {}; 

    // Filters
    if (type) query.type = type;
    if (category) query.category = category;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const records = await Record.find(query)
      .populate("createdBy", "name email")
      .sort({ date: -1 }); // newest first
      
    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a record
// @route   PUT /api/records/:id
// @access  Admin
exports.updateRecord = async (req, res) => {
  try {
    const { amount, type, category, date, notes } = req.body;
    
    if (type && !["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Type must be income or expense" });
    }

    const record = await Record.findByIdAndUpdate(
      req.params.id,
      { amount, type, category, date, notes },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json(record);
  } catch (error) {
    console.error("Error updating record:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a record
// @route   DELETE /api/records/:id
// @access  Admin
exports.deleteRecord = async (req, res) => {
  try {
    const record = await Record.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json({ message: "Record removed successfully" });
  } catch (error) {
    console.error("Error deleting record:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get dashboard summary statistics
// @route   GET /api/records/summary
// @access  Analyst, Admin
exports.getSummary = async (req, res) => {
  try {
    // Pipeline to calculate total income and expense
    const aggregateData = await Record.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    aggregateData.forEach(item => {
      if (item._id === "income") totalIncome = item.total;
      if (item._id === "expense") totalExpense = item.total;
    });

    const netBalance = totalIncome - totalExpense;

    // Pipeline to group by category totals
    const categoryData = await Record.aggregate([
      {
        $group: {
          _id: { type: "$type", category: "$category" },
          total: { $sum: "$amount" }
        }
      },
      {
        $project: {
          _id: 0,
          type: "$_id.type",
          category: "$_id.category",
          total: 1
        }
      }
    ]);

    // Recent activity (last 5 records)
    const recentActivity = await Record.find()
      .sort({ date: -1 })
      .limit(5)
      .populate("createdBy", "name");

    res.status(200).json({
      totalIncome,
      totalExpense,
      netBalance,
      categoryDistribution: categoryData,
      recentActivity
    });
  } catch (error) {
    console.error("Error getting summary:", error);
    res.status(500).json({ message: "Server error" });
  }
};
