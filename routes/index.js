const express = require('express');
const MainController = require('../controllers/maincontroller');

const router = express.Router();

// Home Page
router.get('/', MainController.home);
router.get('/page/:page', MainController.home); // Paginated Home

// Blog
router.get('/blog', MainController.blog);
router.get('/blog/:page', MainController.blog); // Paginated Blog
router.get('/blog/read/:id', MainController.readBlog); // Read Specific Blog

// Anime Details
router.get('/anime/:id', MainController.anime);
router.get('/anime/eps/:link', MainController.readanime); // Episode Details

// Search
router.get('/search/:title/:page', MainController.search); // Paginated Search

// Seasonal Anime
router.get('/season', MainController.season);

// Anime Release Dates
router.get('/date-release', MainController.date);

// Anime List
router.get('/list-anime/:page', MainController.listWithPage);

// Blog Categories
router.get('/blog-category/:category/:page', MainController.blogCategoryByPage);

// Tags
router.get('/tag/:tag', MainController.tag);

// Genre
router.get('/daftar-genre', MainController.daftarGenre); // List Genres
router.get('/genre/:id', MainController.searchByGenre); // Anime by Genre

module.exports = router;
