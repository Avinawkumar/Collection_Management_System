
const { google } = require('googleapis');
const csv = require('csv-parser');
const fs = require('fs');
const cron = require('node-cron');
const Case = require('../models/case');
const logger = require('../utils/logger');
const stream = require('stream');
require("dotenv").config(); 





// Configure Google Sheets API credentials
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: 'collection-management-system@collection-management-system.iam.gserviceaccount.com',
    private_key: process.env.PRIVATE_KEY.split(String.raw`\n`).join('\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});





const fetchAndProcessData = async () => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1yCn8yagBw3CACb3-etTz-JJSMOoD9rEWHhvy1MKqxXQ';
    const range = "'MOCK_DATA'!A1:E"; // Adjust the range as needed

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = res.data.values;
    // console.log(rows)
    const headers = rows.shift(); // Got the header row
    console.log(headers)
    const csvStream = new stream.Readable({
      read() {
        this.push(headers.join(',') + '\n'); // Push the header row
        rows.forEach((row) => {
          this.push(row.join(',') + '\n'); // Push each row as a CSV line
        });
        this.push(null); // Signal the end of the stream
      },
    });

    const chunks = [];
    const chunkSize = 1000; // Process data in chunks of 1000 rows


    csvStream
      .pipe(csv())
      .on('data', (data) => {
        chunks.push(data);
        // console.log("chunks inside:", chunks)
        // console.log(chunks.length)
        if (chunks.length === chunkSize) {
          processChunk(chunks);
          chunks.length = 0;
        }
      })
      .on('end', () => {
        if (chunks.length > 0) {
            // console.log(chunks)
          processChunk(chunks);
        }
        // console.log("chunks inside:", chunks)
        logger.info('CSV data import completed successfully');
      })
      .on('error', (err) => {
        logger.error('Error parsing CSV data:', err);
      });
  } catch (err) {
    logger.error('Error fetching CSV data:', err);
  }
};



const processChunk = async (chunk) => {
    try {
      const newCases = chunk.map((data) => ({
        bankName: data.bankName,
        propertyName: data.propertyName,
        city: data.city,
        borrowerName: data.borrowerName,
        createdAt: data.createdAt
      }));
  
      await Case.collection.insertMany(newCases);
    console.log("done")
    } catch (err) {
      logger.error('Error saving case documents:', err);
    }
  };

  

// Schedule the job to run daily at 10 AM and 5 PM
cron.schedule('0 10,17 * * *', fetchAndProcessData);

module.exports = {fetchAndProcessData};















































// // const { google } = require('googleapis');
// const https = require('https');
// // const cron = require('node-cron');
// // const { Case } = require('./models/Case'); // Ensure the correct path
// // const logger = require('./logger'); // Ensure the correct path

// const fetchAndProcessData = async () => {
//   try {
//     const agent = new https.Agent({
//       rejectUnauthorized: false,
//     });

//     const sheets = google.sheets({ version: 'v4', auth });
//     const spreadsheetId = '1yCn8yagBw3CACb3-etTz-JJSMOoD9rEWHhvy1MKqxXQ';
//     const range = "'Sheet1'!A1:Z"; // Adjust the range as needed

//     const res = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range,
//       agent,
//     });

//     const rows = res.data.values;
//     const headers = rows.shift(); // Get the header row

//     const chunks = [];
//     const chunkSize = 1000; // Process data in chunks of 1000 rows

//     for (const row of rows) {
//       const csvRow = headers.map((header, index) => `${header}:${row[index] || ''}`).join(',');
//       chunks.push(csvRow);

//       if (chunks.length === chunkSize) {
//         await processChunk(chunks, headers);
//         chunks.length = 0;
//       }
//     }

//     if (chunks.length > 0) {
//       await processChunk(chunks, headers);
//     }

//     logger.info('CSV data import completed successfully');
//   } catch (err) {
//     logger.error('Error fetching CSV data:', err);
//   }
// };

// const processChunk = async (chunk, headers) => {
//   try {
//     const bulk = Case.collection.initializeUnorderedBulkOp();

//     for (const csvRow of chunk) {
//       const data = csvRow.split(',').reduce((obj, val, index) => {
//         const [key, value] = val.split(':');
//         obj[headers[index]] = value;
//         return obj;
//       }, {});

//       const newCase = new Case({
//         bankName: data.bankName,
//         propertyName: data.propertyName,
//         city: data.city,
//         borrowerName: data.borrowerName,
//       });
//       bulk.insert(newCase);
//     }

//     await bulk.execute();
//   } catch (err) {
//     logger.error('Error saving case documents:', err);
//   }
// };

// // Schedule the job to run daily at 10 AM and 5 PM
// cron.schedule('0 10,17 * * *', fetchAndProcessData);

// module.exports = { fetchAndProcessData };