const express = require("express");
const mongoose= require("mongoose");
const connected_to_mongoAtlas = require("./configs/db");
var bodyParser = require('body-parser')

const { fetchAndProcessData } = require('./jobs/dataImportJob');
const Case = require("./models/case");
const caseRoutes = require('./routes/caseRoutes');




const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');


 require("dotenv").config(); // 

 const PORT = process.env.port || 3000;
 const app = express();

 app.use(express.json());
 app.use(bodyParser.json())

 app.get("/", (req,res) =>{
    res.send("welcome to Collection Mangement System Api")
})

app.use('/api', caseRoutes);







// fetchAndProcessData()
//   .then(() => {
//     console.log('Data import completed successfully');
//     // Check the database for imported data
//     Case.find({})
//       .then((cases) => {
//         console.log('Imported Cases:', cases);
//       })
//       .catch((err) => {
//         console.error('Error fetching cases:', err);
//       });
//   })
//   .catch((err) => {
//     console.error('Error importing data:', err);
//   });









 app.listen(process.env.port, async() =>{
    try {
        await connected_to_mongoAtlas
        console.log("connected to mongoAtlas")
    } catch (error) {
        console.log(" not connected to mongoAtlas")
        console.log(error);
    }
    console.log(`server is running on port ${PORT}`)
 })



 module.exports = app;