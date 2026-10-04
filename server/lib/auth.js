const bcrypt = require('bcryptjs');

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function publicUser(user) {
  if (!user) return null;
  const { passwordHash, resetToken, resetTokenExpiry, ...safe } = user;
  return safe;
}

module.exports = { hashPassword, comparePassword, publicUser };
