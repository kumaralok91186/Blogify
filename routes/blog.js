const { Router } = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const path = require("path");

const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

// ========================================
// CONSTANTS
// ========================================
const MAX_FILE_SIZE    = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const ALLOWED_MIMES      = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const MAGIC_BYTES = {
  "image/jpeg": [0xFF, 0xD8, 0xFF],
  "image/png":  [0x89, 0x50, 0x4E, 0x47],
  "image/gif":  [0x47, 0x49, 0x46],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
};

// ========================================
// CLOUDINARY CONFIG
// ========================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          "blog-covers",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
  },
});

// ========================================
// FILE VALIDATION
// ========================================
const validateImageFile = (req, file, cb) => {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    console.warn(`[SECURITY] Invalid MIME type: ${file.mimetype} for file: ${file.originalname}`);
    return cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed"));
  }

  const fileExt = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
    console.warn(`[SECURITY] Invalid extension: ${fileExt} for file: ${file.originalname}`);
    return cb(new Error("Invalid file extension. Only .jpg, .jpeg, .png, .webp, and .gif are allowed"));
  }

  const buffer = file.buffer || Buffer.alloc(0);
  const expectedBytes = MAGIC_BYTES[file.mimetype];
  if (buffer.length > 0 && expectedBytes) {
    const fileSignature = Array.from(buffer.slice(0, expectedBytes.length));
    const matches = fileSignature.every((byte, idx) => byte === expectedBytes[idx]);
    if (!matches) {
      console.warn(`[SECURITY] File signature mismatch for: ${file.originalname}`);
      return cb(new Error("File signature validation failed. File may be corrupted or not a valid image"));
    }
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits:     { fileSize: MAX_FILE_SIZE },
  fileFilter: validateImageFile,
});

// ========================================
// HELPER — extract Cloudinary public_id
// ========================================
const getCloudinaryPublicId = (url) => {
  return url.split("/").slice(-2).join("/").split(".")[0]; // "blog-covers/filename"
};

// ========================================
// ROUTES — static/specific paths FIRST
// then dynamic /:id LAST to avoid conflicts
// ========================================

// GET /blog/add-new
router.get("/add-new", (req, res) => {
  if (!req.user) return res.redirect("/user/signin");
  return res.render("addBlog", { user: req.user });
});

// GET /blog/edit/:id
router.get("/edit/:id", async (req, res) => {
  try {
    if (!req.user) return res.redirect("/user/signin");

    const blog = await Blog.findById(req.params.id);

    if (!blog) return res.status(404).send("Blog not found");

    if (blog.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).send("Unauthorized");
    }

    return res.render("editBlog", { user: req.user, blog });
  } catch (error) {
    console.error("Edit page error:", error);
    return res.status(500).send("Error loading blog");
  }
});

// POST /blog/edit/:id
router.post("/edit/:id", upload.single("coverImage"), async (req, res) => {
  try {
    if (!req.user) return res.status(401).send("Please sign in");

    const blog = await Blog.findById(req.params.id);

    if (!blog) return res.status(404).send("Blog not found");

    if (blog.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).send("Unauthorized");
    }

    const { title, body } = req.body;
    const updateData = { title, body };

    if (req.file) {
      // Delete old image from Cloudinary before updating
      const oldPublicId = getCloudinaryPublicId(blog.coverImageURL);
      await cloudinary.uploader.destroy(oldPublicId);
      updateData.coverImageURL = req.file.path;
    }

    await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });

    return res.redirect(`/blog/${req.params.id}`);
  } catch (error) {
    console.error("Blog update error:", error);
    return res.status(500).send("Error updating blog: " + error.message);
  }
});

// POST /blog/delete/:id
router.post("/delete/:id", async (req, res) => {
  try {
    if (!req.user) return res.status(401).send("Please sign in");

    const blog = await Blog.findById(req.params.id);

    if (!blog) return res.status(404).send("Blog not found");

    if (blog.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).send("Unauthorized");
    }

    const publicId = getCloudinaryPublicId(blog.coverImageURL);
    await cloudinary.uploader.destroy(publicId);

    await Comment.deleteMany({ blogId: req.params.id });
    await Blog.findByIdAndDelete(req.params.id);

    return res.redirect("/");
  } catch (error) {
    console.error("Blog delete error:", error);
    return res.status(500).send("Error deleting blog: " + error.message);
  }
});

// POST /blog/comment/:blogId
router.post("/comment/:blogId", async (req, res) => {
  try {
    if (!req.user) return res.redirect("/user/signin");

    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.redirect(`/blog/${req.params.blogId}`);
    }

    await Comment.create({
      content: content.trim(),
      blogId:    req.params.blogId,
      createdBy: req.user._id,
    });

    return res.redirect(`/blog/${req.params.blogId}`);
  } catch (error) {
    console.error("Comment create error:", error);
    return res.status(500).send("Error posting comment");
  }
});

// POST /blog/comment/update/:commentId
router.post("/comment/update/:commentId", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Please sign in" });
    }

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ success: false, message: "Content cannot be empty" });
    }

    await Comment.findByIdAndUpdate(
      req.params.commentId,
      { content: content.trim() },
      { new: true }
    );

    return res.redirect(`/blog/${comment.blogId}`);
  } catch (error) {
    console.error("Comment update error:", error);
    return res.status(500).json({ success: false, message: "Error updating comment" });
  }
});

// POST /blog/comment/delete/:commentId
router.post("/comment/delete/:commentId", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Please sign in" });
    }

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const blogId = comment.blogId;
    await Comment.findByIdAndDelete(req.params.commentId);

    return res.redirect(`/blog/${blogId}`);
  } catch (error) {
    console.error("Comment delete error:", error);
    return res.status(500).json({ success: false, message: "Error deleting comment" });
  }
});

// POST /blog  (create new blog)
router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send("Please sign in to create a blog");
    }
    if (!req.file) {
      return res.status(400).send("Cover image is required");
    }

    const { title, body } = req.body;

    const blog = await Blog.create({
      body,
      title,
      createdBy:     req.user._id,
      coverImageURL: req.file.path,
    });

    return res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    console.error("Blog creation error:", error);
    if (error.message?.includes("Invalid") || error.message?.includes("signature")) {
      console.warn(`[SECURITY] Upload rejected for user ${req.user._id}: ${error.message}`);
      return res.status(400).send(error.message);
    }
    return res.status(500).send("Error creating blog: " + error.message);
  }
});

// GET /blog/:id  ← MUST be last — catches any /:id pattern
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("createdBy");

    if (!blog) return res.status(404).send("Blog not found");

    const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");

    return res.render("blog", { user: req.user, blog, comments });
  } catch (error) {
    console.error("Blog fetch error:", error);
    return res.status(500).send("Error loading blog");
  }
});

// ========================================
// MULTER ERROR HANDLER
// ========================================
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).send(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB`);
    }
  }
  if (error) {
    return res.status(400).send(error.message || "File upload failed");
  }
  next();
});

module.exports = router;