import Skill from '../models/Skill.js';

export const addSkill = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    const skill = new Skill({ name, category, description });
    await skill.save();

    res.status(201).json({ message: 'Skill added', skill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSkill = async (req, res) => {
  try {
    const skills = await Skill.find();
    res.status(200).json(skills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const addSkillsBulk = async (req, res) => {
  try {
    const skillsArray = req.body.skills;
    // ✅ Validate
    if (!Array.isArray(skillsArray) || skillsArray.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of skills.' });
    }
    // ✅ Ensure each skill has required fields
    const invalid = skillsArray.filter(s => !s.name || !s.category || !s.description);
    if (invalid.length > 0) {
      return res.status(400).json({
        message: 'Each skill must include name, category, and description.',
        invalid
      });
    }
    // ✅ Insert multiple documents at once
    const createdSkills = await Skill.insertMany(skillsArray);
    res.status(201).json({
      message: `${createdSkills.length} skills added successfully.`,
      skills: createdSkills
    });
  } catch (err) {
    console.error('❌ Error adding bulk skills:', err);
    res.status(500).json({ message: 'Failed to add skills', error: err.message });
  }
};
