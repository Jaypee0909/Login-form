const validators = {
  isValidEmail: function(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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
    
    user.id = 'user_' + Date.now();
    
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    
    console.log('User saved successfully:', user.username);
    return true;
  },
  
  login: function(username, password) {
    console.log('Attempting login for:', username);
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      if (!user.id) {
        user.id = 'user_' + Date.now();
        const updatedUsers = users.map(u => u.username === username ? user : u);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      }
      
      localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }));
      
      console.log('Login successful for:', username);
      return true;
    }
    
    console.log('Login failed for:', username);
    return false;
  },
  
  getCurrentUser: function() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },
  
  refreshSession: function() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;
    
    if (!currentUser.id) {
      const users = this.getUsers();
      const user = users.find(u => u.username === currentUser.username);
      
      if (user) {
        if (!user.id) {
          user.id = 'user_' + Date.now();
          const updatedUsers = users.map(u => u.username === currentUser.username ? user : u);
          localStorage.setItem('users', JSON.stringify(updatedUsers));
        }
        
        const updatedUser = {
          ...currentUser,
          id: user.id
        };
        
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        return updatedUser;
      }
    }
    
    return currentUser;
  },
  
  logout: function() {
    localStorage.removeItem('currentUser');
    console.log('User logged out');
  },
  
  isAuthenticated: function() {
    return this.getCurrentUser() !== null;
  }
};

export default authService;