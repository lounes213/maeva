const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://lounisbousbaine:85ptd7q7IwFofcPJ@cluster0.je0nq.mongodb.net/maiva?retryWrites=true&w=majority&appName=Cluster0';

async function main() {
  try {
    await mongoose.connect(MONGODB_URI);

    // Define User schema
    const UserSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    });

    // Get User model (or create if it doesn't exist)
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Check if admin user exists
    const adminEmail = 'admin@example.com';
    const existingUser = await User.findOne({ email: adminEmail });

    if (existingUser) {
      // Admin user already exists
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newUser = new User({
        email: adminEmail,
        password: hashedPassword,
        createdAt: new Date(),
      });

      await newUser.save();
    }

    // List all users
    const allUsers = await User.find({});

  } catch (error) {
    // Handle error silently
  } finally {
    await mongoose.disconnect();
  }
}

main();