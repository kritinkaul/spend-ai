const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

// Database simulation - in production, you'd use a real database
const DATA_DIR = path.join(__dirname, '../data');
const UPLOADS_FILE = path.join(DATA_DIR, 'uploads.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
if (!fs.existsSync(UPLOADS_FILE)) {
  fs.writeFileSync(UPLOADS_FILE, '[]');
}

if (!fs.existsSync(TRANSACTIONS_FILE)) {
  fs.writeFileSync(TRANSACTIONS_FILE, '[]');
}

// Helper functions
const readUploads = () => {
  try {
    const data = fs.readFileSync(UPLOADS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading uploads:', error);
    return [];
  }
};

const writeUploads = (uploads) => {
  try {
    fs.writeFileSync(UPLOADS_FILE, JSON.stringify(uploads, null, 2));
  } catch (error) {
    console.error('Error writing uploads:', error);
  }
};

const readTransactions = () => {
  try {
    const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading transactions:', error);
    return [];
  }
};

const writeTransactions = (transactions) => {
  try {
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
  } catch (error) {
    console.error('Error writing transactions:', error);
  }
};

// Category mapping for better categorization
const categorizeMerchant = (description) => {
  const desc = description.toLowerCase();
  
  if (desc.includes('starbucks') || desc.includes('coffee') || desc.includes('cafe')) return 'Food & Dining';
  if (desc.includes('amazon') || desc.includes('shopping') || desc.includes('target') || desc.includes('walmart')) return 'Shopping';
  if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('subscription') || desc.includes('prime')) return 'Entertainment';
  if (desc.includes('grocery') || desc.includes('food') || desc.includes('restaurant') || desc.includes('dining')) return 'Food & Dining';
  if (desc.includes('gas') || desc.includes('fuel') || desc.includes('uber') || desc.includes('lyft') || desc.includes('transport')) return 'Transportation';
  if (desc.includes('gym') || desc.includes('fitness') || desc.includes('health') || desc.includes('pharmacy')) return 'Health & Fitness';
  if (desc.includes('utility') || desc.includes('electric') || desc.includes('water') || desc.includes('internet')) return 'Bills & Utilities';
  if (desc.includes('rent') || desc.includes('mortgage') || desc.includes('home')) return 'Housing';
  if (desc.includes('salary') || desc.includes('deposit') || desc.includes('income') || desc.includes('payroll')) return 'Income';
  if (desc.includes('bank') || desc.includes('fee') || desc.includes('charge')) return 'Banking & Fees';
  
  return 'Other';
};

// Check if transaction is likely recurring
const isRecurring = (description) => {
  const desc = description.toLowerCase();
  return desc.includes('subscription') || 
         desc.includes('netflix') || 
         desc.includes('spotify') || 
         desc.includes('gym') || 
         desc.includes('membership') || 
         desc.includes('monthly') || 
         desc.includes('rent') || 
         desc.includes('utility') ||
         desc.includes('insurance');
};

// Parse CSV file
const parseCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        try {
          // Handle various CSV formats
          const dateField = data.Date || data.date || data.DATE || data['Transaction Date'] || '';
          const descField = data.Description || data.description || data.DESCRIPTION || data.Merchant || data.merchant || '';
          const amountField = data.Amount || data.amount || data.AMOUNT || data.Value || data.value || '0';
          const typeField = data.Type || data.type || data.TYPE || data['Transaction Type'] || '';
          
          // Parse amount - handle both positive/negative and CREDIT/DEBIT formats
          let amount = parseFloat(amountField.toString().replace(/[$,]/g, ''));
          
          // If type is specified, adjust amount accordingly
          if (typeField.toUpperCase() === 'DEBIT' || typeField.toUpperCase() === 'WITHDRAWAL') {
            amount = Math.abs(amount) * -1;
          } else if (typeField.toUpperCase() === 'CREDIT' || typeField.toUpperCase() === 'DEPOSIT') {
            amount = Math.abs(amount);
          }
          
          const transaction = {
            id: uuidv4(),
            date: moment(dateField).format('YYYY-MM-DD'),
            description: descField.trim(),
            amount: amount,
            category: categorizeMerchant(descField),
            type: amount >= 0 ? 'income' : 'expense',
            isRecurring: isRecurring(descField),
            merchant: descField.trim(),
            originalAmount: amountField,
            originalType: typeField
          };
          
          // Only add valid transactions
          if (transaction.date !== 'Invalid date' && transaction.description && !isNaN(transaction.amount)) {
            results.push(transaction);
          }
        } catch (error) {
          console.warn('Error parsing CSV row:', data, error);
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Parse PDF file (basic implementation)
const parsePDFFile = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text;
    
    // Simple PDF parsing - look for transaction patterns
    const lines = text.split('\n');
    const transactions = [];
    
    // Common patterns for bank statements
    const transactionPattern = /(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2})\s+(.+?)\s+([-+]?\$?\d+\.?\d*)/g;
    const datePattern = /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}/;
    const amountPattern = /[-+]?\$?\d+\.?\d*/;
    
    for (const line of lines) {
      const match = transactionPattern.exec(line);
      if (match) {
        const [, dateStr, description, amountStr] = match;
        const amount = parseFloat(amountStr.replace(/[$,]/g, ''));
        
        if (!isNaN(amount) && dateStr && description) {
          const transaction = {
            id: uuidv4(),
            date: moment(dateStr).format('YYYY-MM-DD'),
            description: description.trim(),
            amount: amount,
            category: categorizeMerchant(description),
            type: amount >= 0 ? 'income' : 'expense',
            isRecurring: isRecurring(description),
            merchant: description.trim(),
            source: 'pdf'
          };
          
          if (transaction.date !== 'Invalid date') {
            transactions.push(transaction);
          }
        }
      }
    }
    
    return transactions;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw error;
  }
};

// Remove duplicate transactions
const removeDuplicates = (transactions) => {
  const seen = new Set();
  return transactions.filter(transaction => {
    const key = `${transaction.date}-${transaction.description}-${transaction.amount}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

// Main upload handler
const uploadTransactions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const uploadId = uuidv4();
    
    console.log(`📁 Processing upload: ${fileName} (${fileType})`);

    // Create upload record
    const upload = {
      id: uploadId,
      filename: fileName,
      filetype: fileType,
      status: 'processing',
      created_at: new Date().toISOString(),
      transaction_count: 0
    };

    const uploads = readUploads();
    uploads.push(upload);
    writeUploads(uploads);

    let transactions = [];

    try {
      // Parse file based on type
      if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
        transactions = await parseCSVFile(filePath);
      } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        transactions = await parsePDFFile(filePath);
      } else {
        throw new Error('Unsupported file type');
      }

      // Remove duplicates
      transactions = removeDuplicates(transactions);

      // Add upload reference to each transaction
      transactions.forEach(tx => {
        tx.uploadId = uploadId;
        tx.uploadedAt = new Date().toISOString();
      });

      // Save transactions
      const existingTransactions = readTransactions();
      const allTransactions = [...existingTransactions, ...transactions];
      writeTransactions(allTransactions);

      // Update upload status
      const updatedUploads = readUploads();
      const uploadIndex = updatedUploads.findIndex(u => u.id === uploadId);
      if (uploadIndex !== -1) {
        updatedUploads[uploadIndex].status = 'completed';
        updatedUploads[uploadIndex].transaction_count = transactions.length;
        writeUploads(updatedUploads);
      }

      console.log(`✅ Successfully processed ${transactions.length} transactions from ${fileName}`);

      res.json({
        success: true,
        message: `Successfully processed ${transactions.length} transactions`,
        transaction_count: transactions.length,
        filename: fileName,
        upload_id: uploadId
      });

    } catch (parseError) {
      console.error('File parsing error:', parseError);
      
      // Update upload status to failed
      const updatedUploads = readUploads();
      const uploadIndex = updatedUploads.findIndex(u => u.id === uploadId);
      if (uploadIndex !== -1) {
        updatedUploads[uploadIndex].status = 'failed';
        writeUploads(updatedUploads);
      }

      res.status(400).json({
        success: false,
        error: `Failed to parse ${fileType === 'text/csv' ? 'CSV' : 'PDF'} file: ${parseError.message}`
      });
    }

    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process upload' 
    });
  }
};

// Get upload history
const getUploads = (req, res) => {
  try {
    const uploads = readUploads();
    res.json(uploads.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
  } catch (error) {
    console.error('Error getting uploads:', error);
    res.status(500).json({ error: 'Failed to get upload history' });
  }
};

// Get upload status
const getUploadStatus = (req, res) => {
  try {
    const { id } = req.params;
    const uploads = readUploads();
    const upload = uploads.find(u => u.id === id);
    
    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }
    
    res.json({ status: upload.status });
  } catch (error) {
    console.error('Error getting upload status:', error);
    res.status(500).json({ error: 'Failed to get upload status' });
  }
};

// Delete all data
const deleteAllData = (req, res) => {
  try {
    writeTransactions([]);
    writeUploads([]);
    console.log('🗑️ All data deleted');
    res.json({ 
      success: true, 
      message: 'All transaction data and upload history has been deleted' 
    });
  } catch (error) {
    console.error('Error deleting data:', error);
    res.status(500).json({ error: 'Failed to delete data' });
  }
};

module.exports = {
  uploadTransactions,
  getUploads,
  getUploadStatus,
  deleteAllData,
  // Export data access functions for other controllers
  readTransactions,
  readUploads
}; 