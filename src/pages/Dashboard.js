import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import studentService from '../services/studentService';
import '../styles/Dashboard.css';


function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    grade: '',
    major: '',
    enrollmentDate: '',
    status: 'Active'
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'lastName',
    direction: 'ascending'
  });
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/');
      return;
    }
    
    setCurrentUser(user);
    loadStudentsForUser(user.id);
  }, [navigate]);
  
  const loadStudentsForUser = (userId) => {
    try {
      const allStudents = studentService.getStudentsByUserId(userId);
      setStudents(allStudents);
    } catch (error) {
      console.error("Error loading students:", error);
      setError("Failed to load students. Please try again.");
    }
  };
  
  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSort = (key) => {
    let direction = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };
  
  const sortedStudents = [...students].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });
  
  const filteredStudents = sortedStudents.filter(student => {
    return (
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.major.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const openAddModal = () => {
    setError('');
    
    setFormData({
      studentId: generateStudentId(),
      firstName: '',
      lastName: '',
      email: '',
      grade: '1st year', 
      major: 'BSIT',     
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    });
    setIsAddModalOpen(true);
  };
  
  const openEditModal = (student) => {
    setError('');
    
    setSelectedStudent(student);
    setFormData({
      ...student,
      enrollmentDate: student.enrollmentDate ? student.enrollmentDate.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsEditModalOpen(true);
  };
  
  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setError('');
  };
  
  const generateStudentId = () => {
    const prefix = 'STD';
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const year = new Date().getFullYear().toString().slice(2);
    return `${prefix}${year}${randomNum}`;
  };
  
  const handleAddStudent = (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.firstName.trim() === '') {
      setError('First name is required');
      return;
    }
    
    if (!formData.lastName || !formData.lastName.trim() === '') {
      setError('Last name is required');
      return;
    }
    
    if (!formData.email || !formData.email.trim() === '') {
      setError('Email is required');
      return;
    }
    
    if (!formData.major) {
      setError('Major is required');
      return;
    }
    
    if (!formData.grade) {
      setError('Grade is required');
      return;
    }

    
    try {
      const newStudent = {
        studentId: formData.studentId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        grade: formData.grade,
        major: formData.major,
        enrollmentDate: formData.enrollmentDate,
        status: formData.status,
        userId: currentUser.id,
        createdAt: new Date().toISOString()
      };
      
      console.log("Adding student with data:", newStudent);
      
      const addedStudent = studentService.addStudent(newStudent);
      
      setStudents(prevStudents => [...prevStudents, addedStudent]);
      
      closeModals();
    } catch (error) {
      console.error("Error adding student:", error);
      setError(error.message || 'Failed to add student. Please try again.');
    }
  };
  
  const handleUpdateStudent = (e) => {
    e.preventDefault();
    
    if (!selectedStudent || !selectedStudent.id) {
      setError('Invalid student selected for update');
      return;
    }
    
    try {
      const updatedStudentData = {
        ...formData,
        userId: currentUser.id,
        updatedAt: new Date().toISOString()
      };
      
      const updatedStudent = studentService.updateStudent(selectedStudent.id, updatedStudentData);
      
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student.id === selectedStudent.id ? updatedStudent : student
        )
      );
      
      closeModals();
    } catch (error) {
      console.error("Error updating student:", error);
      setError(error.message || 'Failed to update student. Please try again.');
    }
  };
  
  const handleDeleteStudent = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const success = studentService.deleteStudent(id);
        if (success) {
          setStudents(prevStudents => 
            prevStudents.filter(student => student.id !== id)
          );
        }
      } catch (error) {
        console.error("Error deleting student:", error);
        alert(error.message || 'Failed to delete student. Please try again.');
      }
    }
  };
  
  return (
    <div className="dashboard-container">
      {}
      <div className="dashboard-sidebar">
        <div className="dashboard-logo">
          <h2>TRAILBLAZER</h2>
        </div>
        
        <nav className="dashboard-nav">
          <ul>
            <li className="active">
              <i className="fas fa-user-graduate"></i>
              <span>Students</span>
            </li>
            <li>
              <i className="fas fa-chalkboard-teacher"></i>
              <span>Faculty</span>
            </li>
            <li>
              <i className="fas fa-book"></i>
              <span>Courses</span>
            </li>
            <li>
              <i className="fas fa-chart-line"></i>
              <span>Reports</span>
            </li>
            <li>
              <i className="fas fa-cog"></i>
              <span>Settings</span>
            </li>
          </ul>
        </nav>
      </div>
      
      {}
      <div className="dashboard-main">
        {}
        <header className="dashboard-header">
          <div className="dashboard-title">
            <h1>STUDENT MANAGEMENT</h1>
          </div>
          
          <div className="dashboard-user">
            {currentUser && (
              <>
                <span>Welcome, {currentUser.firstName} {currentUser.lastName}</span>
                <button className="logout-btn" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </>
            )}
          </div>
        </header>
        
        {}
        <div className="dashboard-content">
          <div className="data-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <i className="fas fa-search"></i>
            </div>
            
            <button className="add-btn" onClick={openAddModal}>
              <i className="fas fa-plus"></i> Add Student
            </button>
          </div>
          
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('studentId')}>
                    Student ID {sortConfig.key === 'studentId' && (
                      sortConfig.direction === 'ascending' ? '▲' : '▼'
                    )}
                  </th>
                  <th onClick={() => handleSort('firstName')}>
                    First Name {sortConfig.key === 'firstName' && (
                      sortConfig.direction === 'ascending' ? '▲' : '▼'
                    )}
                  </th>
                  <th onClick={() => handleSort('lastName')}>
                    Last Name {sortConfig.key === 'lastName' && (
                      sortConfig.direction === 'ascending' ? '▲' : '▼'
                    )}
                  </th>
                  <th onClick={() => handleSort('email')}>
                    Email {sortConfig.key === 'email' && (
                      sortConfig.direction === 'ascending' ? '▲' : '▼'
                    )}
                  </th>
                  <th onClick={() => handleSort('major')}>
                    Major {sortConfig.key === 'major' && (
                      sortConfig.direction === 'ascending' ? '▲' : '▼'
                    )}
                  </th>
                  <th onClick={() => handleSort('grade')}>
                    Grade {sortConfig.key === 'grade' && (
                      sortConfig.direction === 'ascending' ? '▲' : '▼'
                    )}
                  </th>
                  <th onClick={() => handleSort('status')}>
                    Status {sortConfig.key === 'status' && (
                      sortConfig.direction === 'ascending' ? '▲' : '▼'
                    )}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data">No students found</td>
                  </tr>
                ) : (
                  filteredStudents.map(student => (
                    <tr key={student.id}>
                      <td>{student.studentId}</td>
                      <td>{student.firstName}</td>
                      <td>{student.lastName}</td>
                      <td>{student.email}</td>
                      <td>{student.major}</td>
                      <td>{student.grade}</td>
                      <td>
                        <span className={`status ${student.status.toLowerCase()}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="actions">
                        <button className="edit-btn" onClick={() => openEditModal(student)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="delete-btn" onClick={() => handleDeleteStudent(student.id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Students</h3>
              <p>{students.length}</p>
            </div>
            <div className="stat-card">
              <h3>Active Students</h3>
              <p>{students.filter(s => s.status === 'Active').length}</p>
            </div>
            <div className="stat-card">
              <h3>On Leave</h3>
              <p>{students.filter(s => s.status === 'On Leave').length}</p>
            </div>
            <div className="stat-card">
              <h3>Graduated</h3>
              <p>{students.filter(s => s.status === 'Graduated').length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Student</h2>
              <button className="modal-close" onClick={closeModals}>×</button>
            </div>
            <div className="modal-body">
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleAddStudent}>
                <div className="form-section">
                  <div className="form-section-title">Student Information</div>
                  <div className="form-group">
                    <label>Student ID</label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      readOnly
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Email</label>
                    <div className="form-field">
                      <i className="field-icon fas fa-envelope"></i>
                      <input
                        type="email"
                        name="email"
                        className="with-icon"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="student@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <div className="form-section-title">Academic Details</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Major</label>
                      <select
                        name="major"
                        value={formData.major}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="" disabled>Select major</option>
                        <option value="BSIT">BSIT</option>
                        <option value="BSTCM">BSTCM</option>
                        <option value="BSCS">BSCS</option>
                        <option value="BSDS">BSDS</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Grade</label>
                      <select
                        name="grade"
                        value={formData.grade}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="" disabled>Select year</option>
                        <option value="1st year">1st year</option>
                        <option value="2nd year">2nd year</option>
                        <option value="3rd year">3rd year</option>
                        <option value="4th year">4th year</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Enrollment Date</label>
                      <input
                        type="date"
                        name="enrollmentDate"
                        value={formData.enrollmentDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Graduated">Graduated</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="cancel-btn" onClick={closeModals}>Cancel</button>
                  <button type="submit" className="save-btn">Add Student</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Student</h2>
              <button className="modal-close" onClick={closeModals}>×</button>
            </div>
            <div className="modal-body">
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleUpdateStudent}>
                <div className="form-section">
                  <div className="form-section-title">Student Information</div>
                  <div className="form-group">
                    <label>Student ID</label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      readOnly
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Email</label>
                    <div className="form-field">
                      <i className="field-icon fas fa-envelope"></i>
                      <input
                        type="email"
                        name="email"
                        className="with-icon"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="student@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <div className="form-section-title">Academic Details</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Major</label>
                      <select
                        name="major"
                        value={formData.major}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="" disabled>Select major</option>
                        <option value="BSIT">BSIT</option>
                        <option value="BSCS">BSCS</option>
                        <option value="BSIS">BSIS</option>
                        <option value="BSECE">BSECE</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Grade</label>
                      <select
                        name="grade"
                        value={formData.grade}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="" disabled>Select year</option>
                        <option value="1st year">1st year</option>
                        <option value="2nd year">2nd year</option>
                        <option value="3rd year">3rd year</option>
                        <option value="4th year">4th year</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Enrollment Date</label>
                      <input
                        type="date"
                        name="enrollmentDate"
                        value={formData.enrollmentDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Graduated">Graduated</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="cancel-btn" onClick={closeModals}>Cancel</button>
                  <button type="submit" className="save-btn">Update Student</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;