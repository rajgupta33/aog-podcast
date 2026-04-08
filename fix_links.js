const fs = require('fs');

const content = fs.readFileSync('episodes content.txt', 'utf8');

const mapping = [
    { epNum: 5, eps: "episode-5.html", match: "NALINI ZINU", thumb: "thumbnails/5.webp" },
    { epNum: 6, eps: "episode-6.html", match: "MEHER RUPA", thumb: "thumbnails/6.webp" },
    { epNum: 7, eps: "episode-7.html", match: "SHAMIN PATEILE", thumb: "thumbnails/7.webp" },
    { epNum: 8, eps: "episode-8.html", match: "NADINE AUDI", thumb: "thumbnails/8.webp" },
    { epNum: 9, eps: "episode-9.html", match: "CHARLOTTE D", thumb: "thumbnails/9.webp" },
    { epNum: 10, eps: "episode-10.html", match: "KANIKKA BATRA", thumb: "thumbnails/10.webp" },
    { epNum: 11, eps: "episode-11.html", match: "LOUISE DAWSON", thumb: "thumbnails/11.webp" },
    { epNum: 12, eps: "episode-12.html", match: "KARTHIK VIJAY", thumb: "thumbnails/12.webp" },
    { epNum: 13, eps: "episode-13.html", match: "MANOJ HINGORANI", thumb: "thumbnails/13.webp" },
    { epNum: 14, eps: "episode-14.html", match: "DISHA ODHRANI", thumb: "thumbnails/4.webp" }
];

const chunks = content.split(/🟣 [A-Z’'\s-]+(?:–|-) FINAL STRUCTURED VERSION/);

function extract(text, regex) {
    let match = text.match(regex);
    return match ? match[1].trim() : '';
}

let episodesData = [];

for (let chunk of chunks) {
    if (chunk.trim().length === 0) continue;
    let title = extract(chunk, /Title:\s*([\s\S]*?)_{3,}/);
    let guestSection = extract(chunk, /🟣 GUEST SECTION\s*([\s\S]*?)_{3,}/);
    let guestName = extract(guestSection, /Name:\s*(.*?)\s*Title:/);
    
    let dmap = mapping.find(m => chunk.toUpperCase().includes(m.match));
    if(!dmap && guestName) {
         dmap = mapping.find(m => guestName.toUpperCase().includes(m.match));
    }
    if(dmap) {
        episodesData.push({
            epNum: dmap.epNum,
            eps: dmap.eps,
            thumb: dmap.thumb,
            title: title.replace(/<[^>]+>/g, '').replace('...', '…')
        });
    }
}

// Ensure it's sorted
episodesData.sort((a,b) => a.epNum - b.epNum);

// 1. Fix Index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');

for (let ep of episodesData) {
    // We expect HTML blocks like:
    // <a href="#" class="episode-card ...">
    //   <div class="episode-thumb">
    //     <img src="thumbnails/5.webp" ...
    //   ...
    //   <h3>EPISODE 5</h3>
    //   <p>...</p>
    
    // We will find the regex that captures from <a href="..." down to </p> that belongs to this episode thumb
    let regex = new RegExp(`(<a\\s+href=")[^"]*("\\s+class="episode-card[^>]*>\\s*<div class="episode-thumb">\\s*<img src="${ep.thumb.replace('/','\\/')}"[^>]*>\\s*<span class="play-badge">▶<\\/span>\\s*<\\/div>\\s*<div class="episode-body">\\s*<h3>EPISODE \\d+<\\/h3>\\s*<p>)[^<]*(<\\/p>)`, 'i');
    
    // If we find it, update it
    if(indexHtml.match(regex)) {
        indexHtml = indexHtml.replace(regex, `$1${ep.eps}$2${ep.title}$3`);
    } else {
        // the HTML could be slightly different
        let altRegex = new RegExp(`(<a\\s+href=")[^"]*("\\s+class="episode-card[^>]*>[\\s\\S]*?<img src="${ep.thumb.replace('/','\\/')}"[\\s\\S]*?<h3>EPISODE \\d+<\\/h3>\\s*<p>)[^<]*(<\\/p>)`, 'i');
        if(indexHtml.match(altRegex)) {
             indexHtml = indexHtml.replace(altRegex, `$1${ep.eps}$2${ep.title}$3`);
        }
    }
}

// Add Episode 14 if missing!
if (!indexHtml.includes('EPISODE 14')) {
    let ep14 = episodesData.find(e => e.epNum === 14);
    let ep13 = episodesData.find(e => e.epNum === 13);
    
    let ep14Html = `
            <div class="swiper-slide">
              <a href="${ep14.eps}" class="episode-card card-solid scale-hover ds-block">
                <div class="episode-thumb">
                  <img src="${ep14.thumb}" alt="Episode 14" />
                  <span class="play-badge">▶</span>
                </div>
                <div class="episode-body">
                  <h3>EPISODE 14</h3>
                  <p>${ep14.title}</p>
                </div>
              </a>
            </div>`;
    
    // insert before closing wrapper
    indexHtml = indexHtml.replace(/(<div class="swiper-slide">\s*<a href="episode-13.html"[^>]*>[\s\S]*?<\/a>\s*<\/div>)/i, `$1${ep14Html}`);
}

fs.writeFileSync('index.html', indexHtml, 'utf8');

// 2. Fix episode-X.html More Episodes section
let fullEpisodes = [
    {eps: "episode-1.html", thumb: "thumbnails/1.webp", title: "She took her 3 kids, 0 clients, and built a global marketing agency"},
    {eps: "episode-2.html", thumb: "thumbnails/14.webp", title: "Why are you not healing… even after trying everything?"},
    {eps: "episode-3.html", thumb: "thumbnails/2.webp", title: "What if happiness isn’t something you chase… but something you unlock?"},
    {eps: "episode-4.html", thumb: "thumbnails/3.webp", title: "Why 2026 will be the biggest opportunity for e-commerce in Dubai"}
].concat(episodesData);

for (let i = 1; i <= 14; i++) {
    let filename = `episode-${i}.html`;
    if(!fs.existsSync(filename)) continue;
    
    let epHtml = fs.readFileSync(filename, 'utf8');
    
    // Find thumbnails in More episodes and update hrefs inside episode grid
    // Look for <div class="episode-grid fade-scroll" ...
    let gridRx = /<div class="episode-grid fade-scroll"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/i;
    let gridMatch = epHtml.match(gridRx);
    
    if(gridMatch) {
        let gridContent = gridMatch[1];
        
        // Let's replace the whole grid content with two random different episodes
        let pool = fullEpisodes.filter(e => e.eps !== filename);
        // pick two random
        let pick1 = pool[Math.floor(Math.random()*pool.length)];
        let pool2 = pool.filter(e => e.eps !== pick1.eps);
        let pick2 = pool2[Math.floor(Math.random()*pool2.length)];
        
        let newContent = `
          <a href="${pick1.eps}" class="episode-card card-solid scale-hover ds-block">
            <div class="episode-thumb">
              <img src="${pick1.thumb}" alt="More Episodes" />
              <span class="play-badge">▶</span>
            </div>
            <div class="episode-body">
              <p>${pick1.title}</p>
            </div>
          </a>
          <a href="${pick2.eps}" class="episode-card card-solid scale-hover ds-block">
            <div class="episode-thumb">
              <img src="${pick2.thumb}" alt="More Episodes" />
              <span class="play-badge">▶</span>
            </div>
            <div class="episode-body">
              <p>${pick2.title}</p>
            </div>
          </a>
        `;
        
        epHtml = epHtml.replace(gridRx, `<div class="episode-grid fade-scroll" style="grid-template-columns: repeat(2, minmax(0, 1fr)); max-width: 800px; margin: 0 auto;">${newContent}</div>\n      </div>\n    </section>`);
        fs.writeFileSync(filename, epHtml, 'utf8');
    }
}

console.log("Fixed all links and titles!");
