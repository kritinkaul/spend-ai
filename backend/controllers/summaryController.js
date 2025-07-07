const getSummary = (req, res) => {
  // Return dummy summary data as requested
  const summary = {
    totalSpent: 1234.56,
    topCategories: [
      { category: "Food", amount: 400 },
      { category: "Rent", amount: 600 },
      { category: "Transportation", amount: 150 },
      { category: "Entertainment", amount: 84.56 }
    ]
  };

  console.log('📊 Returning summary data');
  res.json(summary);
};

module.exports = {
  getSummary
}; 