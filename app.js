require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const Blog = require("./models/blog");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

const apiRoute = require("./routes/api");

const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));
app.use(express.static(path.resolve("./dist")));

// API Routes
app.use("/api", apiRoute);

// Legacy routes (kept for backwards compatibility if needed)
app.get("/legacy-home", async (req, res) => {
  try {
    const allBlogs = await Blog.find({}).populate("createdBy", "fullName profileImageURL").sort({ createdAt: -1 });

    res.render("home", {
      user: req.user,
      blogs: allBlogs,
    });
  } catch (error) {
    console.error("Error in root route:", error);
    res.status(500).send("Something went wrong ❌");
  }
});

app.get("/test", (req, res) => {
  res.send("Server is running ✅");
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

// SPA fallback for React Router
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  const indexPath = path.resolve("./dist/index.html");
  if (require("fs").existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.status(404).send("Front-end build not found. Please run 'npm run build'.");
});

// DB connection + server start
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB is connected!");

    app.listen(PORT, () => {
      console.log(`Server Started at PORT: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });