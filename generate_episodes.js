const fs = require("fs");

let template = fs.readFileSync("/episodes/passion-over-comfort/", "utf8");

// Helpers to inject content seamlessly
function buildPage(template, data) {
    let html = template;
    
    // Meta & Head
    html = html.replace(/<title>.*?<\/title>/s, `<title>${data.title} | The Attitude of Gratitude Podcast</title>`);
    html = html.replace(/<meta name="description" content=".*?" \/>/s, `<meta name="description" content="${data.subtitle}" />`);
    
    // Hero
    html = html.replace(/<h1 class="ep-title.*?<\/h1>/s, `<h1 class="ep-title fade-up">${data.title}</h1>`);
    html = html.replace(/<p class="ep-subtitle.*?>.*?<\/p>/s, `<p class="ep-subtitle fade-up delay-1" style="max-width: 700px; margin-bottom: 24px;">${data.subtitle}</p>`);
    
    // Video
    html = html.replace(/<iframe.*?src=".*?".*?><\/iframe>/s, `<iframe width="560" height="315" src="${data.video_embed}" title="${data.title.replace(/<[^>]*>?/gm, "")}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`);
    
    // Platforms Links
    // Spotify link
    html = html.replace(/href="https:\/\/open\.spotify\.com[^"]*"/, `href="${data.spotify_link}"`);
    // Apple Podcast
    html = html.replace(/href="https:\/\/podcasts\.apple\.com[^"]*"/, `href="${data.apple_link}"`);
    // Amazon
    html = html.replace(/href="https:\/\/music\.amazon\.com[^"]*"/, `href="${data.amazon_link}"`);
    
    // About
    html = html.replace(/<h2 class="fade-scroll"[^>]*>.*?<\/h2>\s*<div class="fade-scroll">\s*<p>.*?<\/ul>\s*<\/div>/s, 
    `<h2 class="fade-scroll" style="font-size: 2rem; margin-bottom: 24px;">${data.about_heading}</h2>
          <div class="fade-scroll">
            <p>${data.about_content.replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br/>")}</p>
          </div>`);
          
    // Learnings
    const learningList = data.learnings.map(l => `<li>${l}</li>`).join("\n            ");
    html = html.replace(/<ul class="check-list">.*?<\/ul>/s, `<ul class="check-list">\n            ${learningList}\n          </ul>`);
    
    // Timestamps
    const tsList = data.timestamps.map(ts => `<li><span class="time">${ts.time}</span> &mdash; <div class="ts-content"><strong>${ts.title}</strong><br/>${ts.desc}</div></li>`).join("\n              ");
    html = html.replace(/<ul class="timestamp-list">.*?<\/ul>/s, `<ul class="timestamp-list">\n              ${tsList}\n            </ul>`);
    
    // Guest Image & Info
    html = html.replace(/<img src="guest images\/ruchi poddar\.webp"[^>]*\/>/s, `<img src="${data.guest_image}" alt="${data.guest_name}" style="border-radius:var(--radius); box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(255,45,120,0.15); width: 100%; object-fit: cover; aspect-ratio: 1/1;" />`);
    html = html.replace(/<h2 style="font-size: 2\.8rem; margin-bottom: 8px;">.*?<\/h2>/, `<h2 style="font-size: 2.8rem; margin-bottom: 8px;">${data.guest_name}</h2>`);
    html = html.replace(/<h3 style="color: var\(--pink-bright.*?>.*?<\/h3>/, `<h3 style="color: var(--pink-bright); font-size: 1.2rem; font-family: var(--font-body); margin-bottom: 24px;">${data.guest_title}</h3>`);
    
    html = html.replace(/<p>Ruchi spent.*?<\/p>\s*<p>After motherhood.*?<\/p>\s*<div.*?<\/div>/s, `<p>${data.guest_content.replace(/\n\n/g,"</p><p>")}</p>
          <div style="margin-top: 24px; padding: 20px; background: rgba(255,45,120,0.06); border-left: 3px solid var(--pink-bright); border-radius: 8px;">
            <p style="margin:0; font-style: italic; color: #fff;">${data.guest_quote}</p>
          </div>`);
          
    // Share embed
    html = html.replace(/https:\/\/attitudeofgratitudepodcast\.com\/episode-1\.html/g, data.share_url);
    
    // Change "More Episodes" thumbnails slightly for variety based on number
    if (data.share_url.includes("episode-2")) {
       html = html.replace(/thumbnails\/2\.webp/, "thumbnails/3.webp");
       html = html.replace(/thumbnails\/3\.webp/, "thumbnails/4.webp");
    } else if (data.share_url.includes("episode-3")) {
       html = html.replace(/thumbnails\/2\.webp/, "thumbnails/4.webp");
       html = html.replace(/thumbnails\/3\.webp/, "thumbnails/1.webp");
    } else if (data.share_url.includes("episode-4")) {
       html = html.replace(/thumbnails\/2\.webp/, "thumbnails/1.webp");
       html = html.replace(/thumbnails\/3\.webp/, "thumbnails/2.webp");
    }
    
    return html;
}

const ep2 = {
    title: "Why are you not healing… <span class=\"highlight\">even after trying everything?</span>",
    subtitle: "What if the thing blocking your healing…is something you’re not even aware of?",
    video_embed: "https://www.youtube-nocookie.com/embed/nASQ-NdUusg",
    youtube_link: "https://youtu.be/nASQ-NdUusg",
    spotify_link: "https://open.spotify.com/episode/04aoKmnNePazt16r2I8pfi",
    apple_link: "https://podcasts.apple.com/us/podcast/why-you-feel-stuck-in-life-hidden-healing-truth-revealed/id1866928542?i=1000759310602",
    amazon_link: "https://music.amazon.com/podcasts/5baef2ba-a9e9-4d23-8abf-ae8627404065/episodes/e51fd9f1-fa47-41e4-b01c-548edba3026d/attitude-of-gratitude-why-you-feel-stuck-in-life-hidden-healing-truth-revealed",
    about_heading: "What if you’re unknowingly blocking your own healing?",
    about_content: "In this powerful episode of The Attitude of Gratitude Podcast, host Sadhna Rishi sits down with Dr. Tanu Kaushal, transformation facilitator and energy healer, to uncover why so many people feel stuck — even after trying multiple healing methods.\nThis conversation goes deeper than typical healing advice. It challenges the idea that healing always comes from outside — and shifts the focus inward.\nFrom emotional trauma to mindset patterns, this episode reveals how your internal state silently shapes your healing journey.\nThis is not about quick fixes… it’s about awareness, alignment, and responsibility.\n<br><br>She opens up about:\n<ul style=\"color: #D0D0D0; line-height: 1.7; margin-bottom: 30px;\">\n<li>Why healing doesn’t always work the way we expect</li>\n<li>How mindset directly affects your reality</li>\n<li>The deeper meaning of gratitude beyond surface-level practice</li>\n</ul>",
    learnings: [
        "Why you might be blocking your own healing",
        "The true meaning of gratitude and how it shifts your energy",
        "How emotional trauma impacts your body and mind",
        "Why healing doesn’t always require an external healer",
        "How awareness can unlock transformation",
        "The role of intuition, aura, and energy in healing"
    ],
    timestamps: [
        {time: "03:06", title: "The Healing Journey Begins", desc: "Understanding why people feel stuck"},
        {time: "05:21", title: "The Healer Within", desc: "Why every family has a natural healer"},
        {time: "06:19", title: "Psychic Abilities Explained", desc: "Understanding intuitive awareness"},
        {time: "09:51", title: "Choosing the Right Healer", desc: "What to look for (and what to avoid)"},
        {time: "13:50", title: "What is an Aura?", desc: "Understanding your energy field"},
        {time: "15:36", title: "Aura Tools & Practices", desc: "How to work with your energy"},
        {time: "20:44", title: "Gratitude as Energy", desc: "Beyond just saying “thank you”"},
        {time: "23:18", title: "Gratitude & Life Shift", desc: "How it changes your reality"}
    ],
    guest_image: "guest images/TANU KAUSHAL.webp",
    guest_name: "Dr. Tanu Kaushal",
    guest_title: "Transformation Facilitator | Energy Healer",
    guest_content: "Dr. Tanu Kaushal is a transformation facilitator and energy healer, guiding individuals through emotional healing, mindset shifts, and spiritual awareness.\n\nThrough her work, she helps people understand the deeper layers of healing — focusing on energy alignment, self-awareness, and conscious living.\n\nHer approach emphasizes that true transformation begins within, not outside.",
    guest_quote: "👉 Healing begins the moment you take responsibility for yourself.",
    share_url: "https://attitudeofgratitudepodcast.com/episodes/not-healing-after-trying-everything/"
};

fs.writeFileSync("/episodes/not-healing-after-trying-everything/", buildPage(template, ep2), "utf8");

const ep3 = {
    title: "What if happiness isn’t something you chase… <span class=\"highlight\">but something you unlock?</span>",
    subtitle: "She didn’t just write about happiness… she decoded it — and discovered what truly creates inner peace beyond success.",
    video_embed: "https://www.youtube-nocookie.com/embed/F8oqSDraDRw",
    youtube_link: "https://youtu.be/F8oqSDraDRw",
    spotify_link: "https://open.spotify.com/episode/02P5Pg0D5fd4XBxpkSGWYI",
    apple_link: "https://podcasts.apple.com/us/podcast/why-most-people-never-feel-truly-happy-radiate-happiness/id1866928542?i=1000749857631",
    amazon_link: "https://music.amazon.com/podcasts/5baef2ba-a9e9-4d23-8abf-ae8627404065/episodes/6a5b0b35-0e64-495f-961a-dafca3695716/attitude-of-gratitude-why-most-people-never-feel-truly-happy-radiate-happiness-author-anjana-sahney-thakker",
    about_heading: "Why do so many people feel unfulfilled… even when life looks successful?",
    about_content: "In this episode, we sit down with Anjana — author of Radiate Happiness — to explore the deeper truths behind joy, mindset, and inner fulfillment.\nThis conversation goes beyond surface-level motivation. It uncovers why happiness often feels temporary — and what truly creates lasting peace.\nThrough personal insights and powerful frameworks, Anjana shares how we can shift from chasing happiness… to actually living it.\n<br><br>She opens up about:\n<ul style=\"color: #D0D0D0; line-height: 1.7; margin-bottom: 30px;\">\n<li>Why external success doesn’t guarantee inner peace</li>\n<li>The hidden patterns that keep people stuck</li>\n<li>How small mindset shifts create deep emotional change</li>\n</ul>",
    learnings: [
        "Why happiness feels temporary for most people",
        "The inner tools you already have (but ignore)",
        "How your mindset silently shapes your emotions",
        "What actually blocks long-term fulfillment",
        "Simple shifts that instantly change your perspective"
    ],
    timestamps: [
        {time: "01:30", title: "The Philosophy of Gratitude", desc: "Why gratitude shifts your entire perspective on life"},
        {time: "02:48", title: "The 10 Things Morning Ritual", desc: "A simple practice to rewire your mindset daily"},
        {time: "04:00", title: "Prayer vs Gratitude", desc: "Understanding the difference between routine and feeling"},
        {time: "07:42", title: "Starting at 55: Breaking Self-Doubt", desc: "Why it’s never too late to begin again"},
        {time: "09:25", title: "Healthy Boundaries", desc: "Why protecting your energy isn’t selfish"},
        {time: "12:48", title: "Self-Love vs Selfishness", desc: "Understanding the real difference"},
        {time: "14:02", title: "Respond, Don’t React", desc: "How to create better relationships and inner peace"},
        {time: "14:44", title: "Mirror Work Exercise", desc: "The power of saying “I love you” to yourself"},
        {time: "23:45", title: "Living for Yourself", desc: "Breaking free from societal expectations"},
        {time: "28:40", title: "The Truth About Manifestation", desc: "Faith + belief + action — what actually works"},
        {time: "38:35", title: "Letting Go of Comparison", desc: "Why comparison blocks happiness"}
    ],
    guest_image: "thumbnails/3.webp", 
    guest_name: "Anjana Sahney Thakker",
    guest_title: "Author of Radiate Happiness | Mindset Guide",
    guest_content: "Anjana is the author of Radiate Happiness, a book focused on inner transformation, emotional clarity, and mindful living.\n\nHer journey is proof that happiness is not something external — it’s something cultivated from within through awareness, gratitude, and intentional thinking.\n\nThrough her work, she helps individuals reconnect with themselves and build a life rooted in peace and purpose.",
    guest_quote: "👉 Happiness isn’t found… it’s created.",
    share_url: "https://attitudeofgratitudepodcast.com/episodes/happiness-is-something-you-unlock/"
};

fs.writeFileSync("/episodes/happiness-is-something-you-unlock/", buildPage(template, ep3), "utf8");

const ep4 = {
    title: "Why 2026 will be the biggest opportunity for <span class=\"highlight\">e-commerce in Dubai</span>",
    subtitle: "From zero to scaling globally —what it really takes to build a successful online business in the UAE today.",
    video_embed: "https://www.youtube-nocookie.com/embed/LYSRFdd9Ja4",
    youtube_link: "https://youtu.be/LYSRFdd9Ja4",
    spotify_link: "https://open.spotify.com/episode/1H2TrOQBu6NigPPKQTYGpZ",
    apple_link: "https://podcasts.apple.com/us/podcast/dubais-e-commerce-boom-2026-how-to-start-scale-an/id1866928542?i=1000747566061",
    amazon_link: "https://music.amazon.com/podcasts/5baef2ba-a9e9-4d23-8abf-ae8627404065/episodes/94fe4617-99d2-4b8e-8f2c-061067ca7c58/attitude-of-gratitude-dubai%E2%80%99s-e-commerce-boom-2026-how-to-start-scale-an-online-business",
    about_heading: "Is now the best time to start an e-commerce business in Dubai?",
    about_content: "In this episode, we sit down with Raina Lalchand, founder of Emarkiz.com and Emarkiz Web Solutions, to break down exactly how to start and scale an e-commerce business in Dubai and the UAE — even if you’re a complete beginner.\nWith Dubai rapidly becoming a global hub for digital entrepreneurship, this conversation dives into the real opportunities, strategies, and mistakes most people don’t see.\nThis is not just theory — it’s a practical roadmap for anyone looking to enter the world of Amazon UAE, Shopify, and global selling.\n<br><br>She opens up about:\n<ul style=\"color: #D0D0D0; line-height: 1.7; margin-bottom: 30px;\">\n<li>Why 2025–2026 is the biggest opportunity window</li>\n<li>How beginners can enter the market with clarity</li>\n<li>The exact systems behind scaling an online business</li>\n</ul>",
    learnings: [
        "How to start an e-commerce business in Dubai step-by-step",
        "Amazon UAE vs Shopify — where should beginners start",
        "The most common mistakes new sellers make",
        "Why product presentation & A+ content drives conversions",
        "Legal setup basics: licensing, compliance & listings",
        "How AI is changing product marketing and growth"
    ],
    timestamps: [
        {time: "00:31", title: "Why E-Commerce Matters in 2026", desc: "The future of online business and why timing matters"},
        {time: "02:40", title: "Raina’s Journey", desc: "From career break to building a successful consultancy"},
        {time: "05:05", title: "The Opportunity Window", desc: "Why now is the best time to start"},
        {time: "06:50", title: "Scaling Small Businesses Online", desc: "Moving beyond offline limitations"},
        {time: "08:00", title: "COVID: The Digital Shift", desc: "How the pandemic changed buying behavior forever"},
        {time: "10:35", title: "Supporting Women Entrepreneurs", desc: "Building confidence, networks, and opportunities"},
        {time: "16:30", title: "Product Presentation & A+ Content", desc: "Why visuals directly impact sales"},
        {time: "18:15", title: "Amazon Requires Skill", desc: "Why beginners fail without proper knowledge"},
        {time: "20:20", title: "Compliance & Keywords", desc: "How to stay visible and avoid mistakes"},
        {time: "23:05", title: "Business Setup Basics", desc: "Licensing, registration, and starting right"},
        {time: "26:20", title: "Marketplace vs Website", desc: "Where to start as a beginner"},
        {time: "31:25", title: "AI in E-Commerce", desc: "Future trends shaping online selling"},
        {time: "32:45", title: "Offline + Online Strategy", desc: "Why hybrid models win"},
        {time: "37:25", title: "Mindset & Networking", desc: "What separates successful founders"},
        {time: "39:00", title: "Message for Women in Business", desc: "Confidence, resilience, and growth"}
    ],
    guest_image: "guest images/raina.webp",
    guest_name: "Raina Lalchand",
    guest_title: "Founder, Emarkiz.com | E-commerce Consultant",
    guest_content: "Raina Lalchand is the founder of Emarkiz.com and Emarkiz Web Solutions, helping businesses launch, optimize, and scale their e-commerce presence in the UAE and globally.\n\nWith deep expertise in Amazon marketplaces, product positioning, and digital growth strategies, she has helped numerous brands navigate the complexities of online selling.\n\nHer work focuses on simplifying e-commerce for beginners while building scalable systems for long-term success.",
    guest_quote: "👉 E-commerce isn’t saturated — it’s just misunderstood.",
    share_url: "https://attitudeofgratitudepodcast.com/episodes/biggest-opportunity-ecommerce-dubai-2026/"
};

fs.writeFileSync("/episodes/biggest-opportunity-ecommerce-dubai-2026/", buildPage(template, ep4), "utf8");
console.log("Episodes generated!");
