# 🔧 Backend Implementation Guide - Template API

## Overview

This guide shows you how to implement the template API endpoints in your Node.js/Express backend to support the template platform feature.

---

## 📋 Database Schema

### Template Model (MongoDB/Mongoose)

```javascript
// models/Template.js
const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    templateData: {
      type: Object,
      required: true,
      // Stores the entire template configuration
    },
    thumbnail: {
      type: String,
      // Base64 encoded image or URL
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ["certificate", "diploma", "award", "badge", "other"],
      default: "certificate",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Indexes for performance
templateSchema.index({ isPublic: 1, createdAt: -1 });
templateSchema.index({ createdBy: 1 });
templateSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Template", templateSchema);
```

---

## 🛣️ API Routes

### routes/templates.js

```javascript
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth"); // Your auth middleware
const {
  createTemplate,
  getPublicTemplates,
  getMyTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  toggleVisibility,
} = require("../controllers/templateController");

// Public routes
router.get("/public", getPublicTemplates);
router.get("/:id", getTemplateById);

// Protected routes (require authentication)
router.post("/", protect, createTemplate);
router.get("/my-templates", protect, getMyTemplates);
router.put("/:id", protect, updateTemplate);
router.delete("/:id", protect, deleteTemplate);
router.patch("/:id/visibility", protect, toggleVisibility);

module.exports = router;
```

### Add to main app.js

```javascript
const templateRoutes = require("./routes/templates");
app.use("/api/templates", templateRoutes);
```

---

## 🎮 Controller Implementation

### controllers/templateController.js

```javascript
const Template = require("../models/Template");
const asyncHandler = require("express-async-handler"); // For error handling

// @desc    Create new template
// @route   POST /api/templates
// @access  Private
exports.createTemplate = asyncHandler(async (req, res) => {
  const { name, description, templateData, thumbnail, isPublic, category } =
    req.body;

  // Validation
  if (!name || !templateData) {
    res.status(400);
    throw new Error("Please provide name and template data");
  }

  // Check if user already has a template with same name
  const existingTemplate = await Template.findOne({
    name,
    createdBy: req.user._id,
  });

  if (existingTemplate) {
    res.status(400);
    throw new Error("You already have a template with this name");
  }

  // Create template
  const template = await Template.create({
    name,
    description: description || "",
    templateData,
    thumbnail: thumbnail || "",
    isPublic: isPublic || false,
    category: category || "certificate",
    createdBy: req.user._id,
  });

  res.status(201).json(template);
});

// @desc    Get all public templates
// @route   GET /api/templates/public
// @access  Public
exports.getPublicTemplates = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, search } = req.query;

  // Build query
  const query = { isPublic: true };

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$text = { $search: search };
  }

  // Execute query with pagination
  const templates = await Template.find(query)
    .populate("createdBy", "name email") // Include creator info
    .select("-templateData") // Exclude full template data for list view
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  // Get total count for pagination
  const count = await Template.countDocuments(query);

  res.json({
    templates,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    total: count,
  });
});

// @desc    Get user's templates
// @route   GET /api/templates/my-templates
// @access  Private
exports.getMyTemplates = asyncHandler(async (req, res) => {
  const templates = await Template.find({ createdBy: req.user._id })
    .sort({ updatedAt: -1 })
    .exec();

  res.json(templates);
});

// @desc    Get template by ID
// @route   GET /api/templates/:id
// @access  Public (but only returns public templates or user's own)
exports.getTemplateById = asyncHandler(async (req, res) => {
  const template = await Template.findById(req.params.id).populate(
    "createdBy",
    "name"
  );

  if (!template) {
    res.status(404);
    throw new Error("Template not found");
  }

  // Check if user can access this template
  const isOwner =
    req.user && template.createdBy._id.toString() === req.user._id.toString();
  const isPublic = template.isPublic;

  if (!isPublic && !isOwner) {
    res.status(403);
    throw new Error("Not authorized to access this template");
  }

  // Increment usage count for public templates
  if (isPublic && !isOwner) {
    template.usageCount += 1;
    await template.save();
  }

  res.json(template);
});

// @desc    Update template
// @route   PUT /api/templates/:id
// @access  Private
exports.updateTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findById(req.params.id);

  if (!template) {
    res.status(404);
    throw new Error("Template not found");
  }

  // Check ownership
  if (template.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this template");
  }

  // Update fields
  const { name, description, templateData, thumbnail, isPublic, category } =
    req.body;

  if (name) template.name = name;
  if (description !== undefined) template.description = description;
  if (templateData) template.templateData = templateData;
  if (thumbnail !== undefined) template.thumbnail = thumbnail;
  if (isPublic !== undefined) template.isPublic = isPublic;
  if (category) template.category = category;

  await template.save();

  res.json(template);
});

// @desc    Delete template
// @route   DELETE /api/templates/:id
// @access  Private
exports.deleteTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findById(req.params.id);

  if (!template) {
    res.status(404);
    throw new Error("Template not found");
  }

  // Check ownership
  if (template.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this template");
  }

  await template.deleteOne();

  res.json({ message: "Template deleted successfully" });
});

// @desc    Toggle template visibility
// @route   PATCH /api/templates/:id/visibility
// @access  Private
exports.toggleVisibility = asyncHandler(async (req, res) => {
  const { isPublic } = req.body;

  if (typeof isPublic !== "boolean") {
    res.status(400);
    throw new Error("Please provide isPublic as boolean");
  }

  const template = await Template.findById(req.params.id);

  if (!template) {
    res.status(404);
    throw new Error("Template not found");
  }

  // Check ownership
  if (template.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to modify this template");
  }

  template.isPublic = isPublic;
  await template.save();

  res.json({
    message: `Template is now ${isPublic ? "public" : "private"}`,
    template,
  });
});
```

---

## 🔒 Auth Middleware Example

### middleware/auth.js

```javascript
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
};
```

---

## 📊 Optional: Analytics Endpoints

### Track template usage

```javascript
// @desc    Get template analytics
// @route   GET /api/templates/:id/analytics
// @access  Private (Owner only)
exports.getTemplateAnalytics = asyncHandler(async (req, res) => {
  const template = await Template.findById(req.params.id);

  if (!template) {
    res.status(404);
    throw new Error("Template not found");
  }

  // Check ownership
  if (template.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  res.json({
    name: template.name,
    usageCount: template.usageCount,
    isPublic: template.isPublic,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  });
});
```

---

## 🧪 Testing the API

### Using cURL

**Create Template:**

```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Professional Certificate",
    "description": "Clean and professional design",
    "templateData": {...},
    "thumbnail": "data:image/jpeg;base64,...",
    "isPublic": true,
    "category": "certificate"
  }'
```

**Get Public Templates:**

```bash
curl http://localhost:3000/api/templates/public
```

**Get My Templates:**

```bash
curl http://localhost:3000/api/templates/my-templates \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get Specific Template:**

```bash
curl http://localhost:3000/api/templates/TEMPLATE_ID
```

**Toggle Visibility:**

```bash
curl -X PATCH http://localhost:3000/api/templates/TEMPLATE_ID/visibility \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isPublic": true}'
```

**Delete Template:**

```bash
curl -X DELETE http://localhost:3000/api/templates/TEMPLATE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🎯 Best Practices

### 1. **Validation**

```javascript
// Use express-validator or Joi
const { body, validationResult } = require("express-validator");

router.post(
  "/",
  protect,
  [
    body("name").notEmpty().trim().isLength({ max: 100 }),
    body("templateData").notEmpty().isObject(),
    body("isPublic").optional().isBoolean(),
  ],
  createTemplate
);
```

### 2. **Rate Limiting**

```javascript
const rateLimit = require("express-rate-limit");

const createTemplateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 templates per 15 minutes
  message: "Too many templates created, please try again later",
});

router.post("/", protect, createTemplateLimiter, createTemplate);
```

### 3. **File Size Limits**

```javascript
// Limit thumbnail size
const MAX_THUMBNAIL_SIZE = 500000; // 500KB

if (thumbnail && thumbnail.length > MAX_THUMBNAIL_SIZE) {
  res.status(400);
  throw new Error("Thumbnail too large. Max size: 500KB");
}
```

### 4. **Sanitization**

```javascript
const sanitize = require("mongo-sanitize");

const name = sanitize(req.body.name);
const description = sanitize(req.body.description);
```

---

## 🚀 Optimization Tips

### 1. **Caching**

```javascript
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

exports.getPublicTemplates = asyncHandler(async (req, res) => {
  const cacheKey = `public_templates_${JSON.stringify(req.query)}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // ... fetch from database ...

  // Store in cache
  cache.set(cacheKey, result);
  res.json(result);
});
```

### 2. **Image Storage**

Instead of storing base64 in database, use cloud storage:

```javascript
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

// Upload thumbnail to S3
const uploadThumbnail = async (base64Data, templateId) => {
  const buffer = Buffer.from(base64Data.split(",")[1], "base64");

  const params = {
    Bucket: "your-bucket-name",
    Key: `templates/${templateId}.jpg`,
    Body: buffer,
    ContentType: "image/jpeg",
    ACL: "public-read",
  };

  const result = await s3.upload(params).promise();
  return result.Location; // URL
};

// In createTemplate controller
if (thumbnail) {
  template.thumbnail = await uploadThumbnail(thumbnail, template._id);
  await template.save();
}
```

### 3. **Indexing**

```javascript
// Add to template model
templateSchema.index({ name: "text", description: "text", tags: "text" });
templateSchema.index({ isPublic: 1, usageCount: -1 }); // Popular public templates
templateSchema.index({ createdBy: 1, updatedAt: -1 }); // User's recent templates
```

---

## 📈 Advanced Features

### Search & Filter

```javascript
exports.searchTemplates = asyncHandler(async (req, res) => {
  const { q, category, sortBy = "recent" } = req.query;

  const query = { isPublic: true };

  // Text search
  if (q) {
    query.$text = { $search: q };
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Sort options
  let sort = {};
  switch (sortBy) {
    case "popular":
      sort = { usageCount: -1 };
      break;
    case "recent":
      sort = { createdAt: -1 };
      break;
    case "name":
      sort = { name: 1 };
      break;
  }

  const templates = await Template.find(query)
    .populate("createdBy", "name")
    .select("-templateData")
    .sort(sort)
    .limit(20);

  res.json(templates);
});
```

### Duplicate Template

```javascript
exports.duplicateTemplate = asyncHandler(async (req, res) => {
  const original = await Template.findById(req.params.id);

  if (!original) {
    res.status(404);
    throw new Error("Template not found");
  }

  // Create copy
  const duplicate = await Template.create({
    name: `${original.name} (Copy)`,
    description: original.description,
    templateData: original.templateData,
    thumbnail: original.thumbnail,
    isPublic: false, // Always private initially
    category: original.category,
    createdBy: req.user._id,
  });

  res.status(201).json(duplicate);
});
```

---

## ✅ Checklist

- [ ] Install dependencies: `mongoose`, `express-async-handler`
- [ ] Create Template model
- [ ] Create routes file
- [ ] Implement controller methods
- [ ] Add authentication middleware
- [ ] Test all endpoints
- [ ] Add validation
- [ ] Add rate limiting
- [ ] Implement caching (optional)
- [ ] Add error handling
- [ ] Add logging
- [ ] Document API in Postman/Swagger

---

## 🔗 Environment Variables

Add to your `.env` file:

```bash
JWT_SECRET=your_jwt_secret_key
MONGO_URI=mongodb://localhost:27017/xertiq
NODE_ENV=development

# Optional: For S3 thumbnail storage
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your-bucket-name
```

---

## 📝 Notes

- **Security**: Always validate and sanitize input
- **Performance**: Use indexes and caching for public templates
- **Storage**: Consider using cloud storage for thumbnails
- **Monitoring**: Log template creation/deletion for analytics
- **Backups**: Regular database backups recommended

---

## 🎉 Done!

Your backend is now ready to support the template platform feature! 🚀
