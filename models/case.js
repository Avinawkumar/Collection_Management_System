const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  bankName: { type: String, required: true },
  propertyName: { type: String, required: true },
  city: { type: String, required: true },
  borrowerName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Case = mongoose.model('Case', caseSchema);

module.exports = Case;