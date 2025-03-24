
const studentService = {
  getAllStudents: function() {
    const students = localStorage.getItem('students');
    return students ? JSON.parse(students) : [];
  },
  
  getStudentsByUserId: function(userId) {
    const students = this.getAllStudents();
    return students.filter(student => student.userId === userId);
  },
  
  getStudentById: function(id) {
    const students = this.getAllStudents();
    return students.find(student => student.id === id);
  },
  
  getStudentsByStatus: function(status) {
    const students = this.getAllStudents();
    return students.filter(student => student.status === status);
  },
  
  addStudent: function(student) {
    
    if (!student.userId) {
        student.userId = "defaultUserId"; 
    }

    if (!student.firstName || !student.lastName || !student.email || !student.studentId || !student.userId) {
        throw new Error('Missing required student information');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(student.email)) {
        throw new Error('Invalid email format');
    }

    const students = this.getAllStudents();

    const existingEmail = students.some(s => s.email === student.email);
    if (existingEmail) {
        throw new Error('A student with this email already exists');
    }

    const existingId = students.some(s => s.studentId === student.studentId);
    if (existingId) {
        throw new Error('A student with this ID already exists');
    }


    const newStudent = {
        ...student,
        id: Date.now().toString()
    };

    students.push(newStudent);
    localStorage.setItem('students', JSON.stringify(students));

    return newStudent;  // Make sure to return the newStudent with the ID
  },
  
  updateStudent: function(id, updatedStudent) {
    const students = this.getAllStudents();
    const index = students.findIndex(student => student.id === id);
    
    if (index === -1) {
      throw new Error('Student not found');
    }
    
    if (!updatedStudent.firstName || !updatedStudent.lastName || !updatedStudent.email || !updatedStudent.userId) {
      throw new Error('Missing required student information');
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(updatedStudent.email)) {
      throw new Error('Invalid email format');
    }
    
    const emailExists = students.some(s => s.email === updatedStudent.email && s.id !== id);
    if (emailExists) {
      throw new Error('This email is already assigned to another student');
    }
    
    if (students[index].userId !== updatedStudent.userId) {
      throw new Error('You do not have permission to update this student');
    }
    
    students[index] = {
      ...students[index],
      ...updatedStudent
    };
    
    localStorage.setItem('students', JSON.stringify(students));
    
    return students[index];  
  },
  
  deleteStudent: function(id) {
    const students = this.getAllStudents();
    const studentToDelete = students.find(student => student.id === id);
    
    if (!studentToDelete) {
      throw new Error('Student not found');
    }
    
    const filteredStudents = students.filter(student => student.id !== id);
    
    localStorage.setItem('students', JSON.stringify(filteredStudents));
    
    return true;
  },
  
  getStudentStats: function(userId) {
    const students = this.getStudentsByUserId(userId);
    
    return {
      total: students.length,
      active: students.filter(s => s.status === 'Active').length,
      onLeave: students.filter(s => s.status === 'On Leave').length,
      graduated: students.filter(s => s.status === 'Graduated').length,
      suspended: students.filter(s => s.status === 'Suspended').length,
      byMajor: this.getStudentCountByField('major', students),
      byGrade: this.getStudentCountByField('grade', students)
    };
  },
  
  getStudentCountByField: function(field, studentsArray) {
    const students = studentsArray || this.getAllStudents();
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