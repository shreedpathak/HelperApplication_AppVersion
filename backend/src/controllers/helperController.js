import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Skill from '../models/Skill.js';

export const getHelpersByCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    // Find all skills under this category
    const skills = await Skill.find({ category: categoryId }).select('_id');
    // console.log('🔍 Skills found for category:', skills);
    const skillIds = skills.map(skill => skill._id);
    // console.log('🧩 Extracted Skill IDs:', skillIds);

    // Find all profiles that have any of these skillIds
    const profiles = await Profile.find({
      'skills.skill': { $in: skillIds },
    })
      .populate('user', 'name email')  // if you want user info
      .populate('skills.skill', 'name categoryName');
    
    // console.log('👤 Profiles found:', profiles.length);
    profiles.forEach((p, i) => {
      // console.log(`\n#${i + 1} Profile ID: ${p._id}`);
      // console.log(`User: ${p.user?.name || "No user"} (${p.user?.email || "No email"})`);
      // console.log('Skills:', p.skills.map(s => s.skill?.name));
    });
    res.status(200).json(profiles);
  } catch (err) {
    console.error('❌ Error fetching helpers by category:', err);
    res.status(500).json({ message: 'Failed to fetch helpers', error: err.message });
  }
};


export const addUserSkill = async (req, res) => {
  try {
    const { skillId, skillName } = req.body;
    
    const userId = req.user?._id; // 🔍 Ensure req.user is populated
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User not found in request' });
      }
  
      // ✅ Validate skillId exists in Skill collection
      const existingSkill = await Skill.findById(skillId);
      if (!existingSkill) {
        return res.status(404).json({ error: 'Skill not found' });
      }
  
      // ✅ Find the profile of the current user
      const profile = await Profile.findOne({ user: userId });
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
  
      // ✅ Avoid duplicate skills
      const skillExists = profile.skills.some(
        (s) => s.skill.toString() === skillId.toString()
      );
      if (skillExists) {
        return res.status(400).json({ error: 'Skill already added to profile' });
      }
  
      // ✅ Add skill to profile's skills array
      profile.skills.push({ skill: skillId, skillName }); // make sure your Profile schema supports this structure
      await profile.save();
  
      res.status(201).json({
        message: 'Skill added to profile',
        skills: profile.skills,
      });
  
    } catch (err) {
      console.error('Add Skill Error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
// Get all helpers
export const getAllHelpers = async (req, res) => {
  try {
    // 1️⃣ Get all users with role: helper
    const helperUsers = await User.find({ role: 'helper' }).select('_id name email role');

    if (helperUsers.length === 0) {
      return res.status(200).json({ helpers: [] });
    }

    const helperIds = helperUsers.map(u => u._id);

    // 2️⃣ Get profiles of these helpers
    const helpers = await Profile.find({ user: { $in: helperIds } })
      .populate('user', 'name email role'); // populate only needed fields

    res.status(200).json({ helpers });

  } catch (err) {
    console.error("❌ Error fetching helpers:", err);
    res.status(500).json({
      message: 'Failed to fetch helpers',
      error: err.message
    });
  }
};

