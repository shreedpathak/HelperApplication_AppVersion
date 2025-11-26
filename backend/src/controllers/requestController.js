import Requests from '../models/Requests.js';

// Create a single request
export const createRequest = async (req, res) => {
  try {
    console.log('createRequest body:', req.body);
    const {
      helperUser,
      neederUser,
      reqTitle,
      reqDescription,
      reqStartTiming,
      reqEndTiming,
      priceType,
      price,
      location,
      address,
    } = req.body;

    // Basic validation: list missing fields for clearer errors
    const missing = [];
    if (!helperUser) missing.push('helperUser');
    if (!neederUser) missing.push('neederUser');
    if (!reqTitle) missing.push('reqTitle');
    if (!reqDescription) missing.push('reqDescription');
    if (!reqStartTiming) missing.push('reqStartTiming');
    if (!reqEndTiming) missing.push('reqEndTiming');
    if (missing.length) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    const start = new Date(reqStartTiming);
    const end = new Date(reqEndTiming);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format.' });
    }

    if (start > end) {
      return res.status(400).json({ error: 'Start time cannot be after end time.' });
    }

    if (start < now || end < now) {
      return res.status(400).json({ error: 'Start and End cannot be in the past.' });
    }

    const newRequest = await Requests.create({
      helperUser,
      neederUser,
      reqTitle,
      reqDescription,
      reqStartTiming: start,
      reqEndTiming: end,
      priceType,
      price,
      location,
      address,
    });

    return res.status(201).json(newRequest);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

// Fetch requests. Accept optional query params: helperUser, neederUser
export const fetchRequests = async (req, res) => {
  try {
    const query = {};
    if (req.query.helperUser) query.helperUser = req.query.helperUser;
    if (req.query.neederUser) query.neederUser = req.query.neederUser;

    const requests = await Requests.find(query).populate('helperUser neederUser');
    return res.status(200).json(requests);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

// Update a request by id. Expect body { id, updates }
export const updateRequests = async (req, res) => {
  try {
    const { id, updates } = req.body;
    if (!id || !updates) return res.status(400).json({ error: 'id and updates required' });

    // Prevent changing createdAt/updatedAt or _id accidentally
    delete updates._id;

    const updated = await Requests.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ error: 'Request not found' });
    return res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

// Delete a request by id. Expect body { id }
export const deleteRequests = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });

    const deleted = await Requests.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Request not found' });
    return res.status(200).json({ message: 'Request deleted', id: deleted._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

