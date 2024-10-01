const validatePassword = password => {
  return {
    length: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special_char: /[@#$!%*?&]/.test(password)
  }
};

module.exports = { validatePassword };
