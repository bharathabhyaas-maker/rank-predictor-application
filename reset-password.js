// Reset password for Gnanvilee Academy
const bcrypt = require('bcryptjs');

console.log('🔧 Resetting password for Gnanvilee Academy...\n');

const newPassword = 'admin123'; // Simple password for testing
const hashedPassword = bcrypt.hashSync(newPassword, 10);

console.log('New hashed password:', hashedPassword);
console.log('New plain password:', newPassword);

// You would need to update this in the database:
// UPDATE users SET password = 'hashedPassword' WHERE email = 'admin@gva.in' AND role = 'INSTITUTION';

console.log('\n📋 TO RESET PASSWORD:');
console.log('1. Run this SQL in your database:');
console.log(`UPDATE users SET password = '${hashedPassword}' WHERE email = 'admin@gva.in' AND role = 'INSTITUTION';`);
console.log('\n2. Then login with:');
console.log('   Email: admin@gva.in');
console.log('   Institution ID: admin557');
console.log('   Password: admin123');
