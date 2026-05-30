const express = require("express");
const ytdl = require("@distube/ytdl-core");
const path = require("path");

const app = express();

// ملفات الواجهة
app.use(express.static(path.join(__dirname, "public")));

// الصفحة الرئيسية
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// التحقق من رابط يوتيوب
function isValidYouTubeUrl(url) {
  return (
    url.includes("youtube.com") ||
    url.includes("youtu.be")
  );
}

// API معلومات الفيديو
app.get("/api/info", async (req, res) => {

  const url = req.query.url;

  if (!url || !isValidYouTubeUrl(url)) {
    return res.status(400).json({
      error: "Invalid YouTube URL"
    });
  }

  try {

    const info = await ytdl.getInfo(url);
    const details = info.videoDetails;

    res.json({
      title: details.title,
      thumbnail: details.thumbnails[details.thumbnails.length - 1].url,
      uploader: details.author.name,
      view_count: details.viewCount
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Could not retrieve video info"
    });

  }

});

// API تحميل الفيديو
app.get("/api/download", async (req, res) => {

  const url = req.query.url;
  const type = req.query.type || "mp4-hd";

  if (!url || !isValidYouTubeUrl(url)) {
    return res.status(400).send("Invalid URL");
  }

  try {

    const info = await ytdl.getInfo(url);

    let format;

    if (type === "mp3") {
      format = ytdl.chooseFormat(info.formats, { quality: "highestaudio" });
    } else {
      format = ytdl.chooseFormat(info.formats, { quality: "highestvideo" });
    }

    res.redirect(format.url);

  } catch (err) {

    console.error(err);

    res.status(500).send("Download failed");

  }

});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});