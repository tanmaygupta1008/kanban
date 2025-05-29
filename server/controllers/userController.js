const User = require('../models/User');

exports.getUserByEmail = async (req, res) => {
    const { email } = req.params;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Return relevant user information (excluding sensitive data like password)
        res.status(200).json({ _id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl });
    } catch (error) {
        console.error('Error fetching user by email:', error);
        res.status(500).json({ message: 'Failed to fetch user' });
    }
};