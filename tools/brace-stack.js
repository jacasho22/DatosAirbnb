const fs = require('fs');
const path = process.argv[2];
const s = fs.readFileSync(path,'utf8');
const lines = s.split(/\r?\n/);
let stack = [];
for(let i=0;i<lines.length;i++){
  const line = lines[i];
  for(let j=0;j<line.length;j++){
    const ch = line[j];
    if(ch==='{') stack.push({line:i+1,col:j+1});
    else if(ch==='}') stack.pop();
  }
}
console.log('Stack size:', stack.length);
if(stack.length>0) console.log('Top of stack:', stack[stack.length-1]);
else console.log('All balanced');
