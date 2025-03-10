// src/services/studentService.js

const studentService = {
    // Get all students from localStorage
    getAllStudents: function() {
      const students = localStorage.getItem('students');
      return students ? JSON.parse(students) : [];
    },
    
    // Get a single student by ID
    getStudentById: function(id) {
      const students = this.getAllStudents();
      return students.find(student => student.id === id);
    },
    
    // Get students by status
    getStudentsByStatus: function(status) {
      const students = this.getAllStudents();
      return students.filter(student => student.status === status);
    },
    
    // Add a new student
    addStudent: function(student) {
      // Basic validation
      if (!student.firstName || !student.lastName || !student.email || !student.studentId) {
        throw new Error('Missing required student information');
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(student.email)) {
        throw new Error('Invalid email format');
      }
      
      const students = this.getAllStudents();
      
      // Check if email already exists
      const existingEmail = students.some(s => s.email === student.email);
      if (existingEmail) {
        throw new Error('A student with this email already exists');
      }
      
      // Check if student ID already exists
      const existingId = students.some(s => s.studentId === student.studentId);
      if (existingId) {
        throw new Error('A student with this ID already exists');
      }
      
      // Generate unique ID for the student
      const newStudent = {
        ...student,
        id: Date.now().toString()
      };
      
      // Add to students array and save
      students.push(newStudent);
      localStorage.setItem('students', JSON.stringify(students));
      
      return newStudent;
    },
    
    // Update an existing student
    updateStudent: function(id, updatedStudent) {
      const students = this.getAllStudents();
      const index = students.findIndex(student => student.id === id);
      
      if (index === -1) {
        throw new Error('Student not found');
      }
      
      // Basic validation
      if (!updatedStudent.firstName || !updatedStudent.lastName || !updatedStudent.email) {
        throw new Error('Missing required student information');
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updatedStudent.email)) {
        throw new Error('Invalid email format');
      }
      
      // Check if email already exists with other students
      const emailExists = students.some(s => s.email === updatedStudent.email && s.id !== id);
      if (emailExists) {
        throw new Error('This email is already assigned to another student');
      }
      
      // Update the student
      students[index] = {
        ...students[index],
        ...updatedStudent
      };
      
      localStorage.setItem('students', JSON.stringify(students));
      
      return students[index];
    },
    
    // Delete a student
    deleteStudent: function(id) {
      const students = this.getAllStudents();
      const filteredStudents = students.filter(student => student.id !== id);
      
      if (filteredStudents.length === students.length) {
        throw new Error('Student not found');
      }
      
      localStorage.setItem('students', JSON.stringify(filteredStudents));
      
      return true;
    },
    
    // Get student statistics
    getStudentStats: function() {
      const students = this.getAllStudents();
      
      return {
        total: students.length,
        active: students.filter(s => s.status === 'Active').length,
        onLeave: students.filter(s => s.status === 'On Leave').length,
        graduated: students.filter(s => s.status === 'Graduated').length,
        suspended: students.filter(s => s.status === 'Suspended').length,
        byMajor: this.getStudentCountByField('major'),
        byGrade: this.getStudentCountByField('grade')
      };
    },
    
    // Helper method to count students by a specific field
    getStudentCountByField: function(field) {
      const students = this.getAllStudents();
      const result = {};
      
      students.forEach(student => {
        const value = student[field] || 'Unspecified';
        
        if (result[value]) {
          result[value]++;
        } else {
          result[value] = 1;
        }
      });
      
      return result;
    }
  };
  
  export default studentService;