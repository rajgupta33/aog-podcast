const fs = require("fs");
const files = ["index.html", "episode-1.html", "collab-booking.html"];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, "utf8");
  
  // Thumbnails
  content = content.replace(/thumbnails\/(\d+)\.(jpeg|jpg|png)/gi, "thumbnails/$1.webp");
  
  // Icons
  content = content.replace(/icons\/youtube\.png/gi, "icons/youtube.webp");
  content = content.replace(/icons\/spotify\.png/gi, "icons/spotify.webp");
  content = content.replace(/icons\/apple podcast\.png/gi, "icons/apple podcast.webp");
  content = content.replace(/icons\/audible\.png/gi, "icons/audible logo.webp");
  
  // Background
  content = content.replace(/background image\.png/gi, "background image.webp");
  
  // Guest Images for slider (if not found as .webp, just map them to some new images)
  content = content.replace(/guest images\/DSC00250\.JPG/gi, "guest images/DSC00250.webp");
  content = content.replace(/guest images\/DSC02228\.JPG/gi, "guest images/ruchi poddar.webp"); 
  content = content.replace(/guest images\/DSC00466\.JPG/gi, "guest images/disha odhrani.webp");
  content = content.replace(/guest images\/DSC01386\.JPG/gi, "guest images/kartik vijaymani.webp");
  content = content.replace(/guest images\/DSC01994\.JPG/gi, "guest images/DSC01994.webp");
  content = content.replace(/guest images\/DSC02227\.JPG/gi, "guest images/manoj hingorani.webp");
  content = content.replace(/guest images\/DSC02537\.JPG/gi, "guest images/DSC02537.webp");
  
  // Update episode-1 host/guest specific
  // None, handled above since it uses DSC02228
  
  fs.writeFileSync(file, content, "utf8");
});
console.log("Replaced image paths in HTML!");
