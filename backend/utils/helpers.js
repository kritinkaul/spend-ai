// Utility functions for SpendAI backend

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US');
};

const validateTransaction = (transaction) => {
  const required = ['date', 'amount', 'description'];
  const missing = required.filter(field => !transaction[field]);
  
  if (missing.length > 0) {
    return { valid: false, missing };
  }
  
  return { valid: true };
};

module.exports = {
  formatCurrency,
  formatDate,
  validateTransaction
}; 