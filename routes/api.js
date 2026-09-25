const { Router } = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const path = require("path");

const Blog = require("../models/blog");
const Comment = require("../models/comment");
const User = require("../models/user");
const { validateToken } = require("../services/authentication");

const router = Router();

// ========================================
// FILE VALIDATION & CLOUDINARY CONFIG
// ========================================
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blog-covers",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
  },
});

const validateImageFile = (req, file, cb) => {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed"));
  }
  const fileExt = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
    return cb(new Error("Invalid file extension. Only .jpg, .jpeg, .png, .webp, and .gif are allowed"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: validateImageFile,
});

const getCloudinaryPublicId = (url) => {
  if (!url) return null;
  return url.split("/").slice(-2).join("/").split(".")[0];
};

// ========================================
// AUTH ENDPOINTS
// ========================================
router.get("/user/me", (req, res) => {
  return res.json({ user: req.user || null });
});

router.post("/user/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    const userPayload = validateToken(token);
    return res.cookie("token", token, { httpOnly: true }).json({
      success: true,
      user: userPayload,
    });
  } catch (error) {
    return res.status(400).json({ error: "Incorrect Email or Password" });
  }
});

router.post("/user/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }
    const newUser = await User.create({ fullName, email, password });
    const token = await User.matchPasswordAndGenerateToken(email, password);
    const userPayload = validateToken(token);
    return res.cookie("token", token, { httpOnly: true }).json({
      success: true,
      user: userPayload,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to create account" });
  }
});

router.post("/user/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ success: true });
});

// ========================================
// BLOG ENDPOINTS
// ========================================

// Get all blogs
router.get("/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find({})
      .populate("createdBy", "fullName profileImageURL")
      .sort({ createdAt: -1 });
    return res.json({ blogs, user: req.user || null });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

// Get single blog post by ID
router.get("/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");
    return res.json({ blog, comments, user: req.user || null });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return res.status(500).json({ error: "Failed to fetch blog" });
  }
});

// Create new blog
router.post("/blogs", upload.single("coverImage"), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Please sign in to create a blog" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Cover image is required" });
    }

    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: "Title and Body are required" });
    }

    const blog = await Blog.create({
      title,
      body,
      createdBy: req.user._id,
      coverImageURL: req.file.path,
    });

    return res.json({ success: true, blogId: blog._id });
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).json({ error: error.message || "Error creating blog" });
  }
});

// Update blog
router.post("/blogs/edit/:id", upload.single("coverImage"), async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Please sign in" });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    if (blog.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { title, body } = req.body;
    const updateData = { title, body };

    if (req.file) {
      const oldPublicId = getCloudinaryPublicId(blog.coverImageURL);
      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId);
        } catch (e) {
          console.warn("Could not delete old image from Cloudinary:", e);
        }
      }
      updateData.coverImageURL = req.file.path;
    }

    await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    return res.json({ success: true, blogId: req.params.id });
  } catch (error) {
    console.error("Error updating blog:", error);
    return res.status(500).json({ error: error.message || "Error updating blog" });
  }
});

// Delete blog
router.post("/blogs/delete/:id", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Please sign in" });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    if (blog.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const publicId = getCloudinaryPublicId(blog.coverImageURL);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.warn("Could not delete image from Cloudinary:", e);
      }
    }

    await Comment.deleteMany({ blogId: req.params.id });
    await Blog.findByIdAndDelete(req.params.id);

    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return res.status(500).json({ error: error.message || "Error deleting blog" });
  }
});

// ========================================
// COMMENT ENDPOINTS
// ========================================
router.post("/comments/:blogId", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Please sign in" });

    const { content } = req.body;
    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Comment content cannot be empty" });
    }

    const newComment = await Comment.create({
      content: content.trim(),
      blogId: req.params.blogId,
      createdBy: req.user._id,
    });

    const populatedComment = await Comment.findById(newComment._id).populate("createdBy");

    return res.json({ success: true, comment: populatedComment });
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({ error: "Error posting comment" });
  }
});

router.post("/comments/update/:commentId", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Please sign in" });

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (comment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { content } = req.body;
    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Content cannot be empty" });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { content: content.trim() },
      { new: true }
    ).populate("createdBy");

    return res.json({ success: true, comment: updatedComment });
  } catch (error) {
    console.error("Error updating comment:", error);
    return res.status(500).json({ error: "Error updating comment" });
  }
});

router.post("/comments/delete/:commentId", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Please sign in" });

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (comment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ error: "Error deleting comment" });
  }
});

module.exports = router;
