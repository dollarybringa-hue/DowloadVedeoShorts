const express = require("express");
const { exec } = require("child_process");
const path = require("path");

const app = express();
const PORT = 3000;

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
app.get("/api/info", (req, res) => {

  const url = req.query.url;

  if (!url || !isValidYouTubeUrl(url)) {
    return res.status(400).json({
      error: "Invalid YouTube URL"
    });
  }

  const command =
    `py -m yt_dlp --dump-json "${url}"`;

  exec(command, (error, stdout, stderr) => {

    if (error) {

      console.log(stderr);

      return res.status(500).json({
        error: "Could not retrieve video info"
      });

    }

    try {

      const data = JSON.parse(stdout);

      res.json({
        title: data.title,
        thumbnail: data.thumbnail,
        uploader: data.uploader,
        view_count: data.view_count
      });

    } catch {

      res.status(500).json({
        error: "JSON parse error"
      });

    }

  });

});

// API تحميل الفيديو
app.get("/api/download", (req, res) => {

  const url = req.query.url;
  const type = req.query.type || "mp4-hd";

  if (!url || !isValidYouTubeUrl(url)) {
    return res.status(400).send("Invalid URL");
  }

  let format = "best";

  if (type === "mp3") {
    format = "bestaudio";
  }

  const command =
    `py -m yt_dlp -f "${format}" -g "${url}"`;

  exec(command, (error, stdout, stderr) => {

    if (error) {

      console.log(stderr);

      return res.status(500).send("Download failed");

    }

    const directUrl = stdout.trim();

    res.redirect(directUrl);

  });

});

// تشغيل السيرفر
app.listen(PORT, () => {

  console.log(
    `⚡ Server running at http://localhost:${PORT}`
  );

});