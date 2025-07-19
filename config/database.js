-- School Management System Database Schema
-- Database: school_management_system

-- Users table (for authentication and role management)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student', 'parent', 'staff') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Schools table (for multi-school support)
CREATE TABLE schools (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(100),
    established_year YEAR,
    principal_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Academic years table
CREATE TABLE academic_years (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT,
    year_name VARCHAR(20) NOT NULL, -- e.g., "2024-2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- Classes/Grades table
CREATE TABLE classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT,
    class_name VARCHAR(50) NOT NULL, -- e.g., "Grade 1", "Form 1"
    section VARCHAR(10), -- e.g., "A", "B", "C"
    capacity INT DEFAULT 30,
    class_teacher_id INT,
    academic_year_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

-- Students table
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    school_id INT,
    student_id VARCHAR(20) UNIQUE NOT NULL, -- School-generated ID
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    address TEXT,
    phone VARCHAR(20),
    emergency_contact VARCHAR(20),
    parent_guardian_name VARCHAR(100),
    parent_phone VARCHAR(20),
    parent_email VARCHAR(100),
    class_id INT,
    admission_date DATE,
    status ENUM('active', 'inactive', 'graduated', 'transferred') DEFAULT 'active',
    profile_photo VARCHAR(255),
    medical_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

-- Staff table
CREATE TABLE staff (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    school_id INT,
    staff_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    address TEXT,
    phone VARCHAR(20),
    emergency_contact VARCHAR(20),
    position VARCHAR(100), -- Teacher, Principal, Admin, etc.
    department VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(10,2),
    status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
    qualifications TEXT,
    profile_photo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- Subjects table
CREATE TABLE subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT,
    subject_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(20) UNIQUE,
    description TEXT,
    credits INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- Class subjects (which subjects are taught in which class)
CREATE TABLE class_subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT,
    subject_id INT,
    teacher_id INT,
    academic_year_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES staff(id) ON DELETE SET NULL,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

-- Timetable
CREATE TABLE timetable (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT,
    subject_id INT,
    teacher_id INT,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    start_time TIME,
    end_time TIME,
    room_number VARCHAR(20),
    academic_year_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES staff(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

-- Attendance table
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    class_id INT,
    date DATE,
    status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
    remarks TEXT,
    marked_by INT, -- staff_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES staff(id) ON DELETE SET NULL,
    UNIQUE KEY unique_attendance (student_id, date)
);

-- Exams table
CREATE TABLE exams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT,
    exam_name VARCHAR(100) NOT NULL,
    exam_type ENUM('midterm', 'final', 'quiz', 'assignment', 'project') DEFAULT 'midterm',
    academic_year_id INT,
    start_date DATE,
    end_date DATE,
    total_marks INT DEFAULT 100,
    passing_marks INT DEFAULT 40,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

-- Grades/Results table
CREATE TABLE grades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    exam_id INT,
    subject_id INT,
    marks_obtained DECIMAL(5,2),
    total_marks DECIMAL(5,2) DEFAULT 100,
    grade VARCHAR(5), -- A+, A, B+, etc.
    remarks TEXT,
    created_by INT, -- staff_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES staff(id) ON DELETE SET NULL
);

-- Finance - Fee Structure
CREATE TABLE fee_structure (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT,
    class_id INT,
    fee_type VARCHAR(100) NOT NULL, -- Tuition, Transport, Hostel, etc.
    amount DECIMAL(10,2) NOT NULL,
    frequency ENUM('monthly', 'quarterly', 'semester', 'annual') DEFAULT 'monthly',
    academic_year_id INT,
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

-- Finance - Student Fees
CREATE TABLE student_fees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    fee_structure_id INT,
    due_date DATE,
    amount_due DECIMAL(10,2),
    amount_paid DECIMAL(10,2) DEFAULT 0,
    payment_status ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
    payment_date DATE,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structure(id) ON DELETE CASCADE
);

-- Finance - Expenses
CREATE TABLE expenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT,
    category VARCHAR(100), -- Salary, Utilities, Maintenance, etc.
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE,
    payment_method VARCHAR(50),
    receipt_number VARCHAR(100),
    created_by INT, -- staff_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES staff(id) ON DELETE SET NULL
);

-- Communication - Messages
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT,
    sender_id INT, -- user_id
    recipient_type ENUM('individual', 'class', 'all_students', 'all_staff', 'all_parents'),
    recipient_id INT, -- class_id or user_id based on recipient_type
    subject VARCHAR(200),
    message TEXT NOT NULL,
    message_type ENUM('announcement', 'notice', 'personal', 'emergency') DEFAULT 'personal',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- E-Learning - Courses
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT,
    course_name VARCHAR(200) NOT NULL,
    course_code VARCHAR(20) UNIQUE,
    description TEXT,
    instructor_id INT,
    class_id INT,
    subject_id INT,
    academic_year_id INT,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES staff(id) ON DELETE SET NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

-- E-Learning - Course Materials
CREATE TABLE course_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    material_type ENUM('document', 'video', 'audio', 'link', 'quiz') DEFAULT 'document',
    file_path VARCHAR(500),
    file_size INT, -- in bytes
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INT, -- staff_id
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES staff(id) ON DELETE SET NULL
);

-- E-Learning - Assignments
CREATE TABLE assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATETIME,
    max_marks INT DEFAULT 100,
    submission_type ENUM('file', 'text', 'both') DEFAULT 'file',
    created_by INT, -- staff_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES staff(id) ON DELETE SET NULL
);

-- E-Learning - Assignment Submissions
CREATE TABLE assignment_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT,
    student_id INT,
    submission_text TEXT,
    file_path VARCHAR(500),
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    marks_obtained DECIMAL(5,2),
    feedback TEXT,
    graded_by INT, -- staff_id
    graded_at TIMESTAMP NULL,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by) REFERENCES staff(id) ON DELETE SET NULL
);

-- Library - Books
CREATE TABLE library_books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT,
    isbn VARCHAR(20) UNIQUE,
    title VARCHAR(300) NOT NULL,
    author VARCHAR(200),
    publisher VARCHAR(200),
    publication_year YEAR,
    category VARCHAR(100),
    total_copies INT DEFAULT 1,
    available_copies INT DEFAULT 1,
    location VARCHAR(100), -- Shelf location
    price DECIMAL(8,2),
    added_date DATE DEFAULT (CURRENT_DATE),
    condition_status ENUM('excellent', 'good', 'fair', 'poor') DEFAULT 'good',
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- Library - Book Issues
CREATE TABLE library_issues (
    id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT,
    student_id INT,
    issue_date DATE DEFAULT (CURRENT_DATE),
    due_date DATE,
    return_date DATE NULL,
    fine_amount DECIMAL(6,2) DEFAULT 0,
    status ENUM('issued', 'returned', 'overdue') DEFAULT 'issued',
    issued_by INT, -- staff_id
    returned_to INT, -- staff_id
    FOREIGN KEY (book_id) REFERENCES library_books(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (issued_by) REFERENCES staff(id) ON DELETE SET NULL,
    FOREIGN KEY (returned_to) REFERENCES staff(id) ON DELETE SET NULL
);

-- Transport - Routes
CREATE TABLE transport_routes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT,
    route_name VARCHAR(100) NOT NULL,
    route_number VARCHAR(20) UNIQUE,
    start_location VARCHAR(200),
    end_location VARCHAR(200),
    distance_km DECIMAL(5,2),
    estimated_time INT, -- in minutes
    fare DECIMAL(8,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- Transport - Vehicles
CREATE TABLE transport_vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT,
    vehicle_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type ENUM('bus', 'van', 'car') DEFAULT 'bus',
    capacity INT,
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    driver_license VARCHAR(50),
    route_id INT,
    registration_date DATE,
    insurance_expiry DATE,
    fitness_expiry DATE,
    status ENUM('active', 'maintenance', 'inactive') DEFAULT 'active',
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES transport_routes(id) ON DELETE SET NULL
);

-- Transport - Student Transport
CREATE TABLE student_transport (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    route_id INT,
    pickup_point VARCHAR(200),
    drop_point VARCHAR(200),
    monthly_fee DECIMAL(8,2),
    academic_year_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES transport_routes(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

-- Hostel - Rooms
CREATE TABLE hostel_rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT,
    room_number VARCHAR(20) NOT NULL,
    room_type ENUM('single', 'double', 'triple', 'dormitory') DEFAULT 'double',
    capacity INT,
    current_occupancy INT DEFAULT 0,
    floor_number INT,
    building_name VARCHAR(100),
    monthly_rent DECIMAL(8,2),
    facilities TEXT, -- AC, WiFi, etc.
    status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- Hostel - Student Accommodation
CREATE TABLE student_accommodation (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    room_id INT,
    check_in_date DATE,
    check_out_date DATE,
    monthly_rent DECIMAL(8,2),
    security_deposit DECIMAL(8,2),
    academic_year_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES hostel_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

-- Events and Activities
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT,
    event_name VARCHAR(200) NOT NULL,
    description TEXT,
    event_type ENUM('academic', 'sports', 'cultural', 'meeting', 'holiday') DEFAULT 'academic',
    start_date DATE,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    venue VARCHAR(200),
    organizer_id INT, -- staff_id
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (organizer_id) REFERENCES staff(id) ON DELETE SET NULL
);

-- Notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(200),
    message TEXT,
    type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- System Settings
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by INT, -- staff_id
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES staff(id) ON DELETE SET NULL,
    UNIQUE KEY unique_setting (school_id, setting_key)
);

-- Add class_teacher_id foreign key constraint
ALTER TABLE classes ADD CONSTRAINT fk_classes_teacher
FOREIGN KEY (class_teacher_id) REFERENCES staff(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_school ON students(school_id);
CREATE INDEX idx_staff_school ON staff(school_id);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_exam ON grades(exam_id);
CREATE INDEX idx_fees_student ON student_fees(student_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_type, recipient_id);
CREATE INDEX idx_library_issues_student ON library_issues(student_id);
CREATE INDEX idx_library_issues_status ON library_issues(status);