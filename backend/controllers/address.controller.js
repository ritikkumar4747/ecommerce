import User from "../models/user.models.js";

export const listAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.addresses || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.id);
    if (!addr) return res.status(404).json({ error: 'Address not found' });
    res.json(addr);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createAddress = async (req, res) => {
  try {
    const data = req.body;
    // Server-side validation
    const required = ["recipientName", "line1", "city", "postalCode", "country"];
    for (const f of required) {
      if (!data[f] || String(data[f]).trim() === "") return res.status(400).json({ error: `${f} is required` });
    }
    // phone format validation: allow digits, spaces, +, -, parentheses; min 7 max 20
    if (data.phone) {
      const phoneNorm = String(data.phone).trim();
      const phoneRe = /^[0-9+()\-\s]{7,20}$/;
      if (!phoneRe.test(phoneNorm)) return res.status(400).json({ error: 'phone has invalid format' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // if address marked default, unset others
    if (data.isDefault) {
      user.addresses.forEach(a => (a.isDefault = false));
    }

    user.addresses.push(data);
    await user.save();
    res.status(201).json(user.addresses[user.addresses.length - 1]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const data = req.body;
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.id);
    if (!addr) return res.status(404).json({ error: 'Address not found' });
    // Validate if provided
    const required = ["recipientName", "line1", "city", "postalCode", "country"];
    for (const f of required) {
      if (f in data && (!data[f] || String(data[f]).trim() === "")) return res.status(400).json({ error: `${f} is required` });
    }
    if (data.phone) {
      const phoneNorm = String(data.phone).trim();
      const phoneRe = /^[0-9+()\-\s]{7,20}$/;
      if (!phoneRe.test(phoneNorm)) return res.status(400).json({ error: 'phone has invalid format' });
    }

    if (data.isDefault) {
      user.addresses.forEach(a => (a.isDefault = false));
    }

    Object.assign(addr, data);
    await user.save();
    res.json(addr);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.id);
    if (!addr) return res.status(404).json({ error: 'Address not found' });
    addr.remove();
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { listAddresses, getAddress, createAddress, updateAddress, deleteAddress };
