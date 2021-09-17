var express = require('express');
var app = express();
port = process.env.PORT || 3000;
var FreeSlots = require('./freeslots.js');

app.get("/freeslots", FreeSlots.getSlots);

app.listen(port);

console.log(' Google Calndar API server started on: http://localhost:' + port);