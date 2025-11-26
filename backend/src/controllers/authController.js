import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Profile from '../models/Profile.js'; // <-- Import Profile model
import Skill from '../models/Skill.js';


const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey';

export const signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Create and associate Profile with default values
    const profile = await Profile.create({
      user: user._id,
      area: {},
      designation: user.role,
      experience: 0,
      jobTiming: {},
      rating: {},
      skills: [],
      isProfileCompleted: false,
    });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        profileId: profile._id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};

export const login = async (req, res) => {
  console.log("Login request body:", req.body);
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '1d',
    });
    console.log("Token_login:", token);
    res.status(200).json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const bulkUserCreator = async (req, res) => {
  try {
    const password = '123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const users = [];
    const helperCount = 25;
    const neederCount = 25;

    // Generate Helpers
    for (let i = 1; i <= helperCount; i++) {
      users.push({
        name: `Helper User ${i}`,
        email: `helper${i}@example.com`,
        password: hashedPassword,
        role: 'helper'
      });
    }

    // Generate Needers
    for (let i = 1; i <= neederCount; i++) {
      users.push({
        name: `Needer User ${i}`,
        email: `needer${i}@example.com`,
        password: hashedPassword,
        role: 'needer'
      });
    }

    const createdUsers = await User.insertMany(users);

    res.status(201).json({
      message: `${createdUsers.length} users created successfully.`,
      users: createdUsers.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role
      }))
    });
  } catch (err) {
    console.error('❌ Error creating bulk users:', err);
    res.status(500).json({
      message: 'Failed to create bulk users',
      error: err.message
    });
  }
};

export const profileCreator = async (req, res) => {
  try {
    const {
      user,
      designation,
      experience,
      skills,
      area,
      jobTiming,
      rating
    } = req.body;

    // ✅ Validate user ID
    if (!user) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    // ✅ Ensure user exists
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // ✅ Check if profile already exists
    const existingProfile = await Profile.findOne({ user });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists for this user.' });
    }

    // ✅ Validate skills (must have both skill ID and name)
    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one skill.' });
    }

    // ✅ (Optional) Verify that skills exist in the Skill collection
    const skillIds = skills.map(s => s.skill);
    const validSkills = await Skill.find({ _id: { $in: skillIds } });

    if (validSkills.length !== skills.length) {
      return res.status(400).json({ message: 'One or more skills are invalid.' });
    }

    // ✅ Create profile
    const profile = new Profile({
      user,
      designation,
      experience,
      skills,
      area,
      jobTiming,
      rating,
      isProfileCompleted: true
    });

    await profile.save();

    res.status(201).json({
      message: 'Profile created successfully.',
      profile
    });

  } catch (err) {
    console.error('❌ Error creating profile:', err);
    res.status(500).json({
      message: 'Failed to create profile.',
      error: err.message
    });
  }
};

export const addProfilesBulk = async (req, res) => {
  try {
    const profilesArray = req.body.profiles;

    // ✅ Validate input
    if (!Array.isArray(profilesArray) || profilesArray.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of profiles.' });
    }

    // ✅ Validate each profile in array
    const invalidProfiles = profilesArray.filter(p =>
      !p.user || !p.designation || !Array.isArray(p.skills) || p.skills.length === 0
    );

    if (invalidProfiles.length > 0) {
      return res.status(400).json({
        message: 'Each profile must include user, designation, and at least one skill.',
        invalidProfiles
      });
    }

    // ✅ Collect all user IDs and skill IDs to validate them in bulk
    const userIds = profilesArray.map(p => p.user);
    const allSkillIds = profilesArray.flatMap(p => p.skills.map(s => s.skill));

    const existingUsers = await User.find({ _id: { $in: userIds } });
    const validSkills = await Skill.find({ _id: { $in: allSkillIds } });

    const existingUserIds = new Set(existingUsers.map(u => u._id.toString()));
    const validSkillIds = new Set(validSkills.map(s => s._id.toString()));

    // ✅ Filter invalid users or skills
    const invalid = profilesArray.filter(p =>
      !existingUserIds.has(p.user) ||
      p.skills.some(s => !validSkillIds.has(s.skill))
    );

    if (invalid.length > 0) {
      return res.status(400).json({
        message: 'Some profiles contain invalid users or skill IDs.',
        invalid
      });
    }

    // ✅ Check if profile already exists for any user
    const existingProfiles = await Profile.find({ user: { $in: userIds } });
    const existingProfileUserIds = new Set(existingProfiles.map(p => p.user.toString()));

    const newProfiles = profilesArray.filter(
      p => !existingProfileUserIds.has(p.user)
    );

    if (newProfiles.length === 0) {
      return res.status(400).json({ message: 'All users already have profiles.' });
    }

    // ✅ Mark all new profiles as completed
    newProfiles.forEach(p => {
      p.isProfileCompleted = true;
    });

    // ✅ Insert all profiles
    const createdProfiles = await Profile.insertMany(newProfiles);

    res.status(201).json({
      message: `${createdProfiles.length} profiles created successfully.`,
      profiles: createdProfiles
    });

  } catch (err) {
    console.error('❌ Error adding bulk profiles:', err);
    res.status(500).json({ message: 'Failed to add profiles', error: err.message });
  }
};
