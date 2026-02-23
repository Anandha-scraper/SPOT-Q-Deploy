const mongoose = require('mongoose');
const User = require('../models/user');
const path = require('path');
// npm run create-admin
if (require.main === module) {
    const rootEnv = path.join(__dirname, '..', '..', '.env');
    const backendEnv = path.join(__dirname, '..', '.env');
    require('dotenv').config({ path: rootEnv });
    if (!process.env.MONGODB_URI) {
        require('dotenv').config({ path: backendEnv });
    }
}
async function createAdminUser(employeeId, password, name = 'Administrator') {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }
        const employeeIdUpper = employeeId.toUpperCase();

        const existing = await User.findOne({ employeeId: employeeIdUpper });

        if (existing) {
            return {
                success: false,
                action: 'exists',
                user: existing.toJSON(),
                message: `Admin with Employee ID "${employeeIdUpper}" already exists.`
            };
        }

        // Create new admin
        const admin = new User({
            employeeId: employeeIdUpper,
            name,
            password, // hashed by pre-save hook
            department: 'Admin',
            role: 'admin',
            isActive: true
        });

        await admin.save();

        return {
            success: true,
            action: 'created',
            user: admin.toJSON(),
            message: `Admin user "${employeeIdUpper}" created successfully.`
        };
    } catch (error) {
        throw { success: false, error: error.message, code: error.code };
    }
}

async function runAsScript() {
    try {
        const employeeId = process.env.ADMIN_ID;
        const password   = process.env.ADMIN_PASSWORD;
        const name       = process.env.ADMIN_NAME || 'Administrator';

        if (!employeeId || !password) {
            console.error('Missing required env vars: ADMIN_ID, ADMIN_PASSWORD');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected\n');

        const result = await createAdminUser(employeeId, password, name);

        if (result.action === 'exists') {
            console.log(`Admin already exists!`);
            console.log(`Employee ID : ${result.user.employeeId}`);
            console.log(`Name        : ${result.user.name}`);
            console.log(`Role        : ${result.user.role}`);
        } else if (result.success) {
            console.log(`Admin created successfully!`);
            console.log(`Employee ID : ${result.user.employeeId}`);
            console.log(`Name        : ${result.user.name}`);
            console.log(`Role        : ${result.user.role}`);
        }
    } catch (error) {
        console.error('Error:', error.error || error.message);
        process.exit(1);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        process.exit(0);
    }
}

// Export the function for use in other modules
module.exports = { createAdminUser };

// Run as standalone script if called directly
if (require.main === module) {
    runAsScript();
}

