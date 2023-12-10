const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const cleanCache  = require('../middlewares/cleanCache');

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    const blogs = await Blog
      .find({_user: req.user.id})
      .cache({key: req.user.id});
    res.send(blogs);
  });

  app.post('/api/blogs', requireLogin, cleanCache, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      // console.log('handler1');
      // throw new Error('Super error');
      await blog.save();
      // console.log('handler2');
      res.send(blog);
    } catch (err) {
      // console.log('handler err 1');
      res.status(400).send(err);
      // console.log('handler err 2');
    }
    
  });
};


// const redis = require('redis');
//     const redisUrl = 'redis://127.0.0.1:6379';
//     const client = redis.createClient(redisUrl);

//     const util = require('util');
//     client.get = util.promisify(client.get);

//     const cachedBlogs = await client.get(req.user.id);
//     if(cachedBlogs) {
//       console.log('SERVING FROM CACHE');
//       return res.send(JSON.parse(cachedBlogs));
//     }

//     const blogs = await Blog.find({ _user: req.user.id });
//     console.log('SERVING FROM MONGO');
    
//     res.send(blogs);
//     client.set(req.user.id, JSON.stringify(blogs));