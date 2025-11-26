import Category from '../models/Category.js';

export const addCategory = async (req, res) => {
  try {
    const categories = req.body; // Assuming the categories are passed as an array

    const createdCategories = await Category.insertMany(categories); // Bulk insert

    res.status(201).json({
      message: 'Categories added successfully!',
      categories: createdCategories
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCategory = async (req, res) => {
  try {
    const categories = await Category.find(); // Fetch all categories

    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const updateCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // e.g. { icon: "🚿" }

    const updatedCategory = await Category.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedCategory)
      return res.status(404).json({ message: 'Category not found!' });

    res.status(200).json({
      message: 'Category updated successfully!',
      category: updatedCategory
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const bulkUpdateCategories = async (req, res) => {
  try {
    const updates = req.body; // Array of objects with _id and fields to update

    const bulkOps = updates.map(cat => ({
      updateOne: {
        filter: { _id: cat._id },
        update: { $set: cat },
      },
    }));

    const result = await Category.bulkWrite(bulkOps);

    res.status(200).json({
      message: 'Categories updated successfully!',
      result,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};