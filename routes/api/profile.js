const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth'); 

const profile = require('../../routes/api/models/profile');
const User = require('../../routes/api/models/User');

// @route   GET api/profile/me
// @desk    get current users profile
// @access  private
router.get('/me', auth, async (req,res) => {
    try {
      const profile = await profile.findone({user: req.user.id}).populate(
          'user',
          ['name','avatar']
      );
      if(!profile){
          return res.status(400).json({ msg: 'there is no profile for this user'});
      }
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');  
    }
});

module.exports = router;  