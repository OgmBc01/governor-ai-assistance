const bcrypt = require('bcrypt');

const password = 'admin123'; // Change this to your desired password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nAdd this to your .env file:');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
});