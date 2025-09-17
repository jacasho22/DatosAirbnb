const fs = require('fs');
const path = process.argv[2];
const s = fs.readFileSync(path,'utf8');
const lines = s.split(/\r?\n/);
let balance = 0;
for(let i=0;i<lines.length;i++){
  const line = lines[i];
  const opens = (line.match(/{/g)||[]).length;
  const closes = (line.match(/}/g)||[]).length;
  const prev = balance;
  balance += opens - closes;
  if(prev !== balance) console.log(`${i+1}: ${prev} -> ${balance} | ${line.trim()}`);
}
console.log('Final balance:', balance);
