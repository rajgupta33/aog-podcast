const fs = require('fs');
let s = fs.readFileSync('episodes content.txt', 'utf8');
let chunks = s.split(/🟣 [A-Z’'\s-]+(?:–|-) FINAL STRUCTURED VERSION/);
for(let chunk of chunks) {
    if(chunk.trim() === '') continue;
    let m = chunk.match(/🟣 TIMESTAMPS\s*([\s\S]*?)_{3,}/);
    if(m) {
        let lines = m[1].split(/\r?\n/).map(l=>l.trim()).filter(x=>x);
        console.log("Timestamps lines count:", lines.length);
    } else {
        console.log("No timestamps match");
    }
}
