const express = require('express');
 const router = express.Router();
 const { check, validationResult } = require('express-validator/check');
 const auth = require('../../routes/api/middleware/auth');

const Post = require('../../routes/api/models/Post');
const Profile = require('../../routes/api/models/Profile');
const User = require('../../routes/api/models/User');

 // @route   POST api/posts
 // @desk    create a post
 // @access  private
 router.post('/', [ auth, [
    check('text', 'Text is required')
      .not()
      .isEmpty()
 ]
 ] , 
  async  (req, res) => {
      const errors = validationResult(req);
      if(!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array()});
      }
      try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post ({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

         const post = await newPost.save();

         res.json(post);
          
      } catch (err) {
         console.error(err.message);
         res.status(500).send('server error'); 
      }
    
      
  }
 );

 // @route   GET api/posts
 // @desk    Get all posts
 // @access  private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (err) {
     console.error(err.message);
     res.status(500).send('server error');
    }
});

 // @route   GET api/post/:id
 // @desk    Get post by id 
 // @access  private
 router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post) {
            return res.status(404).json({ msg: 'post not found'});
        }
        res.json(post);
    } catch (err) {
     console.error(err.message);
     if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'post not found'});
    }
     res.status(500).send('server error');
    }
});


 module.exports = router;