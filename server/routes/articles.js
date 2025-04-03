const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Article = require('../models/Article');

// @route   GET api/articles
// @desc    Get all articles
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Allow filtering by category
    const { category } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    const articles = await Article.find(query).sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/articles/:id
// @desc    Get article by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ msg: 'Article not found' });
    }

    res.json(article);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Article not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/articles
// @desc    Create an article (admin only)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, author, category, imageUrl } = req.body;

    // For now, allow any authenticated user to create articles
    // In a real app, you would add admin validation here

    const newArticle = new Article({
      title,
      content,
      author,
      category,
      imageUrl
    });

    const article = await newArticle.save();
    res.json(article);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/articles/:id
// @desc    Update an article (admin only)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, category, imageUrl } = req.body;

    // Find article
    let article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ msg: 'Article not found' });
    }

    // Build article object
    const articleFields = {};
    if (title) articleFields.title = title;
    if (content) articleFields.content = content;
    if (category) articleFields.category = category;
    if (imageUrl) articleFields.imageUrl = imageUrl;

    // Update
    article = await Article.findByIdAndUpdate(
      req.params.id,
      { $set: articleFields },
      { new: true }
    );

    res.json(article);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Article not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/articles/:id
// @desc    Delete an article (admin only)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ msg: 'Article not found' });
    }

    await article.remove();
    res.json({ msg: 'Article removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Article not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/articles/categories
// @desc    Get all unique categories
// @access  Public
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Article.distinct('category');
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 