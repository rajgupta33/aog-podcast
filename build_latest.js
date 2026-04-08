const fs = require('fs');

const content = fs.readFileSync('episodes content.txt', 'utf8');

const mapping = [
    { eps: "episode-5.html", match: "NALINI ZINU", thumb: "thumbnails/5.webp", img: "guest images/Nalini Zinu.webp" },
    { eps: "episode-6.html", match: "MEHER RUPA", thumb: "thumbnails/6.webp", img: "guest images/meher rupa.webp" },
    { eps: "episode-7.html", match: "SHAMIN PATEILE", thumb: "thumbnails/7.webp", img: "guest images/shamin.webp" },
    { eps: "episode-8.html", match: "NADINE AUDI", thumb: "thumbnails/8.webp", img: "guest images/nadine.jpg" },
    { eps: "episode-9.html", match: "CHARLOTTE D", thumb: "thumbnails/9.webp", img: "guest images/Charlotte D'Souza.webp" },
    { eps: "episode-10.html", match: "KANIKKA BATRA", thumb: "thumbnails/10.webp", img: "guest images/Kanikka Batra.webp" },
    { eps: "episode-11.html", match: "LOUISE DAWSON", thumb: "thumbnails/11.webp", img: "guest images/Louise Dawson.webp" },
    { eps: "episode-12.html", match: "KARTHIK VIJAY", thumb: "thumbnails/12.webp", img: "guest images/kartik vijyamani.webp" },
    { eps: "episode-13.html", match: "MANOJ HINGORANI", thumb: "thumbnails/13.webp", img: "guest images/manoj hingorani.webp" },
    { eps: "episode-14.html", match: "DISHA ODHRANI", thumb: "thumbnails/4.webp", img: "guest images/disha odhrani.webp" }
];

let template = fs.readFileSync("episode-1.html", "utf8");

function buildPage(template, data) {
    let html = template;
    
    html = html.replace(/<title>.*?<\/title>/s, `<title>${data.title.replace(/<[^>]+>/g, '')} | The Attitude of Gratitude Podcast</title>`);
    html = html.replace(/<meta name="description" content=".*?" \/>/s, `<meta name="description" content="${data.subtitle.replace(/<[^>]+>/g, '').replace(/"/g, '&quot;')}" />`);
    
    html = html.replace(/<h1 class="ep-title.*?<\/h1>/s, `<h1 class="ep-title fade-up">${data.title}</h1>`);
    html = html.replace(/<p class="ep-subtitle.*?>.*?<\/p>/s, `<p class="ep-subtitle fade-up delay-1" style="max-width: 700px; margin-bottom: 24px;">${data.subtitle}</p>`);
    
    html = html.replace(/<iframe.*?src=".*?".*?><\/iframe>/s, `<iframe width="560" height="315" src="${data.video_embed}" title="${data.title.replace(/<[^>]*>?/g, "")}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`);
    
    html = html.replace(/href="https:\/\/open\.spotify\.com[^"]*"/, `href="${data.spotify_link}"`);
    html = html.replace(/href="https:\/\/podcasts\.apple\.com[^"]*"/, `href="${data.apple_link}"`);
    html = html.replace(/href="https:\/\/music\.amazon\.com[^"]*"/, `href="${data.amazon_link}"`);
    
    html = html.replace(/<h2 class="fade-scroll"[^>]*>.*?<\/h2>\s*<div class="fade-scroll">\s*<p>.*?<\/ul>\s*<\/div>/s, 
    `<h2 class="fade-scroll" style="font-size: 2rem; margin-bottom: 24px;">${data.about_heading}</h2>
          <div class="fade-scroll">
             <p>${data.about_content.split('\\n').filter(p=>p.trim()).join("</p><p>")}</p>
          </div>`);
          
    const learningList = data.learnings.map(l => `<li>${l}</li>`).join("\n            ");
    html = html.replace(/<ul class="check-list">.*?<\/ul>/s, `<ul class="check-list">\n            ${learningList}\n          </ul>`);
    
    const tsList = data.timestamps.map(ts => `<li><span class="time">${ts.time}</span> &mdash; <div class="ts-content"><strong>${ts.title}</strong><br/>${ts.desc}</div></li>`).join("\n              ");
    html = html.replace(/<ul class="timestamp-list">.*?<\/ul>/s, `<ul class="timestamp-list">\n              ${tsList}\n            </ul>`);
    
    html = html.replace(/<img src="guest images\/ruchi poddar\.webp"[^>]*\/>/s, `<img src="${data.guest_image}" alt="${data.guest_name}" style="border-radius:var(--radius); box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(255,45,120,0.15); width: 100%; object-fit: cover; aspect-ratio: 1/1;" />`);
    html = html.replace(/<h2 style="font-size: 2\.8rem; margin-bottom: 8px;">.*?<\/h2>/, `<h2 style="font-size: 2.8rem; margin-bottom: 8px;">${data.guest_name}</h2>`);
    html = html.replace(/<h3 style="color: var\(--pink-bright.*?>.*?<\/h3>/, `<h3 style="color: var(--pink-bright); font-size: 1.2rem; font-family: var(--font-body); margin-bottom: 24px;">${data.guest_title}</h3>`);
    
    html = html.replace(/<p>Ruchi spent.*?<\/p>\s*<p>After motherhood.*?<\/p>\s*<div.*?<\/div>/s, `<p>${data.guest_content.split('\\n').filter(p=>p.trim()).join("</p><p>")}</p>
          <div style="margin-top: 24px; padding: 20px; background: rgba(255,45,120,0.06); border-left: 3px solid var(--pink-bright); border-radius: 8px;">
            <p style="margin:0; font-style: italic; color: #fff;">${data.guest_quote}</p>
          </div>`);
          
    html = html.replace(/https:\/\/attitudeofgratitudepodcast\.com\/episode-1\.html/g, `https://attitudeofgratitudepodcast.com/${data.eps}`);
    
    // Replace "more episodes" random thumbnails to vary them
    // just replacing the two thumbnails at the end
    let t1 = `<img src="thumbnails/${Math.floor(Math.random() * 12) + 1}.webp" alt="More Episodes" />`;
    let t2 = `<img src="thumbnails/${Math.floor(Math.random() * 12) + 1}.webp" alt="More Episodes" />`;
    
    html = html.replace(/<img src="thumbnails\/14\.webp" alt="Episode 2" \/>/, t1);
    html = html.replace(/<img src="thumbnails\/2\.webp" alt="Episode 3" \/>/, t2);
    
    return html;
}


const chunks = content.split(/🟣 [A-Z’'\s-]+(?:–|-) FINAL STRUCTURED VERSION/);

let idx = 1;

// The text chunk parsing logic
function extract(text, regex) {
    let match = text.match(regex);
    return match ? match[1].trim() : '';
}

for (let chunk of chunks) {
    if (chunk.trim().length === 0) continue;
    
    let title = extract(chunk, /Title:\s*([\s\S]*?)_{3,}/);
    let subtitle = extract(chunk, /Subtitle:\s*([\s\S]*?)_{3,}/);
    let embed = extract(chunk, /🟣 VIDEO EMBED\s*([\s\S]*?)_{3,}/);
    let aboutHeading = extract(chunk, /Heading:\s*([\s\S]*?)Content:/);
    
    let aboutContentMatch = chunk.match(/Content:\s*([\s\S]*?)_{3,}/);
    let aboutContentRaw = aboutContentMatch ? aboutContentMatch[1] : '';
    let aboutContentLines = aboutContentRaw.split(/\r?\n/).map(l=>l.trim()).filter(l=>l);
    
    // convert list to HTML
    let ul = [];
    let pLines = [];
    let inList = false;
    for(let l of aboutContentLines) {
        if(l.startsWith('* ')) {
            ul.push('<li>' + l.substring(2) + '</li>');
        } else {
            pLines.push(l);
        }
    }
    let aboutContent = pLines.join('<br/>') + (ul.length > 0 ? '<br/><br/><ul style="color: #D0D0D0; line-height: 1.7; margin-bottom: 30px;">' + ul.join('') + '</ul>' : '');
    
    let takeawaysRaw = extract(chunk, /🟣 WHAT YOU’LL TAKE AWAY\s*([\s\S]*?)_{3,}/);
    let learnings = takeawaysRaw.split(/\r?\n/).filter(l=>l.trim().startsWith('*')).map(l=>l.replace('*', '').trim());
    
    let timestampsRaw = extract(chunk, /🟣 TIMESTAMPS\s*([\s\S]*?)_{3,}/);
    let timestampsLines = timestampsRaw.split(/\r?\n/).map(l=>l.trim()).filter(l=>l);
    let timestamps = [];
    for(let i=0; i<timestampsLines.length; i+=2) {
        if (i+1 < timestampsLines.length) {
            let t = timestampsLines[i].replace(/[—–-]/g, '').trim().split(' ');
            let time = t[0];
            let tt = t.slice(1).join(' ').trim();
            timestamps.push({ time: time, title: tt, desc: timestampsLines[i+1] });
        }
    }
    
    let guestSection = extract(chunk, /🟣 GUEST SECTION\s*([\s\S]*?)_{3,}/);
    let guestName = extract(guestSection, /Name:\s*(.*?)\s*Title:/);
    let guestTitle = extract(guestSection, /Title:\s*(.*?)\s*Content:/);
    let guestContent = extract(guestSection, /Content:\s*([\s\S]*?)\s*Quote Box:/);
    let guestQuote = extract(guestSection, /Quote Box:\s*([\s\S]*)/);
    
    let linksSection = extract(chunk, /🟣 OTHER LINKS\s*([\s\S]*)/);
    let sp = extract(linksSection, /Spotify:\s*(.*?)\s*Apple/);
    let ap = extract(linksSection, /Apple Podcast:\s*(.*?)\s*Amazon/);
    let am = extract(linksSection, /Amazon Music:\s*(.*?)$/s);
    
    // Find the right mapping
    let dmap = mapping.find(m => chunk.toUpperCase().includes(m.match));
    if(!dmap && guestName) {
         dmap = mapping.find(m => guestName.toUpperCase().includes(m.match));
    }
    if(!dmap) continue;
    
    let guestContentLines = guestContent.split(/\r?\n/).map(l=>l.trim()).filter(l=>l);
    let guestContentFormatted = guestContentLines.join("</p><p>");
    
    let data = {
        title: title,
        subtitle: subtitle,
        video_embed: embed,
        spotify_link: sp,
        apple_link: ap,
        amazon_link: am,
        about_heading: aboutHeading,
        about_content: aboutContent,
        learnings: learnings,
        timestamps: timestamps,
        guest_image: dmap.img,
        guest_name: guestName,
        guest_title: guestTitle,
        guest_content: guestContentFormatted,
        guest_quote: guestQuote,
        share_url: "https://attitudeofgratitudepodcast.com/" + dmap.eps,
        eps: dmap.eps
    };
    
    let out = buildPage(template, data);
    fs.writeFileSync(dmap.eps, out, 'utf8');
}
console.log('done writing episodes pages');

