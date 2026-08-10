const fs = require('fs');
const buffer = fs.readFileSync('public/models/AliciaSolid.vrm');
console.log(buffer.slice(0, 20).toString('utf-8'));
