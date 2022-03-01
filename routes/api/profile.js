const express = require('express');
const router = express.Router();
const auth = require('../../routes/api/middleware/auth');
const { check, validationResult } = require('express-validator'); 

const Profile = require('./models/Profile');
const User = require('../../routes/api/models/User');
const { route } = require('express/lib/application');

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
  const {
    company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedin
  } = req.body;
    //bulid profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    //build social object
    profileFields.social = {}
    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter = twitter;
    if(facebook) profileFields.social.facebook = facebook;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if(profile) {
        //update
        profile= await Profile.findOneAndUpdate(
        { user: req.user.id},
        { $set: profileFields},
        { new: true}
      );
      return res.json(profile);
        }
        //create
        profile = new Profile(profileFields);
        
        await profile.save();
        res.json(profile); 
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error'); 
    }
    
 }
);

// @route   GET api/profile
// @desk    get all profiles 
// @access  public
router.get('/', async (req, res) => {
 try {
   const profiles = await Profile.find().populate('user', ['name','avatar']);
   res.json(profiles);
 } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
 }

});

// @route   GET api/profile/user/:user_id
// @desk    get profile by user id 
// @access  public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name','avatar']);

    if(!profile) return res.status(400).json({ msg: 'there is no profile for this user' });
    res.json(profile);
  } catch (err) {
     console.error(err.message);
     if(err.kind == 'ObjectId'){
      return res.status(400).json({ msg: 'profile not found' });
     }
     res.status(500).send('Server Error');
  }
 
 });

 // @route Delete api profiles
// @desk  delete profile, user $posts  
// @access  private
router.delete('/',auth, async (req, res) => {
  try {
    //@todo - remove users posts

    // remove profile 
    await Profile.findOneAndRemove( { user: req.user.id});
    //remove user
    await User.findByIdAndRemove({_id: req.user.id });

    res.json({ msg: 'User deleted'});
  } catch (err) {
     console.error(err.message);
     res.status(500).send('Server Error');
  }
 
 });

 // @route PUT api/profile/experience
// @desk  add profile experience 
// @access  private
router.put(
  '/experience',
  [
    auth,
    [
      check('title','title is required')
      .not()
      .isEmpty(),
      check('company','company is required')
      .not()
      .isEmpty(),
      check('from','from date is required')
      .not()
      .isEmpty(),
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body

    const newEXP = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    }
    try {
      const profile = await Profile.findOne( { user: req.user.id });

      profile.experience.unshift(newEXP);

      await profile.save();

      res.json(profile)
      
    } catch (err) {
      console.error(err.message)
      res.status(500).send('server error');
    }

    }
  
);

// @route DELETE api/profile/experience/:exp_id 
// @desk  Delete profile experience 
// @access  private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne( { user: req.user.id });
    
    //get remove index
    const removeIndex = profile.experience
    .map(item => item.id)
    .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message)
    res.status(500).send('server error');
  }
});


module.exports = router;  