const express = require('express');
const router = express.Router();
const auth = require('../../routes/api/middleware/auth');
const { check, validationResult } = require('express-validator'); 

const Profile = require('./models/Profile');
const User = require('../../routes/api/models/User');

// @route   GET api/profile/me
// @desk    get current users profile
// @access  private
router.get('/me', auth, async (req, res) => {
    try {
      const profile = await Profile.findOne({user: req.user.id}).populate(
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

// @route   POST api/profile
// @desk    Create or update users profile
// @access  private
router.post(
  '/',
  [
    auth,
   [
    check('status', 'status is required')
    .not()
    .isEmpty(),
    check('skills', 'skills is required')
    .not()
    .isEmpty()
   ]
],
 async (req, res) =>{
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }

    
 }
);

module.exports = router;  