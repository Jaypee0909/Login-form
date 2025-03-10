const validators = {
  isValidEmail: function(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  isValidPassword: function(password) {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    
    if (!/\d/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one special character' };
    }
    
    return { valid: true };
  },
  
  isValidName: function(name) {
    if (!name || name.trim() === '') {
      return { valid: false, message: 'Name cannot be empty' };
    }
    
   
    const nameRegex = /^[A-Za-z\s-]+$/;
    if (!nameRegex.test(name)) {
      return { valid: false, message: 'Name should contain only letters, spaces, and hyphens' };
    }
    
    return { valid: true };
  }
};


const authService = {

  getUsers: function() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  },
  

  saveUser: function(user) {
    // Validate firstName
    const firstNameValidation = validators.isValidName(user.firstName);
    if (!firstNameValidation.valid) {
      throw new Error(`First name: ${firstNameValidation.message}`);
    }
    
  
    const lastNameValidation = validators.isValidName(user.lastName);
    if (!lastNameValidation.valid) {
      throw new Error(`Last name: ${lastNameValidation.message}`);
    }
    
   
    if (!validators.isValidEmail(user.email)) {
      throw new Error('Please enter a valid email address');
    }
    

    const passwordValidation = validators.isValidPassword(user.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }
    
    const users = this.getUsers();
    
    const existingUsername = users.some(u => u.username === user.username);
    if (existingUsername) {
      throw new Error('Username already exists');
    }
    
   
    const existingEmail = users.some(u => u.email === user.email);
    if (existingEmail) {
      throw new Error('Email address is already registered');
    }
    

    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  },
  

  login: function(username, password) {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {

      localStorage.setItem('currentUser', JSON.stringify({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }));
      return true;
    }
    return false;
  },
  
  
  getCurrentUser: function() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },

  logout: function() {
    localStorage.removeItem('currentUser');
  }
};

export default authService;