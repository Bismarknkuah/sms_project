-- Insert branches first
INSERT INTO branches (branch_code, branch_name, location) VALUES
('assin_fosu', 'Assin Fosu (Main Campus)', 'Assin Fosu'),
('accra', 'Accra', 'Accra'),
('dunkwa_on_offin', 'Dunkwa-on-Offin', 'Dunkwa-on-Offin'),
('mankessim', 'Mankessim', 'Mankessim'),
('sefwi_asawinso', 'Sefwi Asawinso', 'Sefwi Asawinso'),
('takoradi', 'Takoradi', 'Takoradi'),
('new_edubiase', 'New Edubiase', 'New Edubiase');

-- Insert sample users (use bcrypt to hash these passwords)
INSERT INTO users (username, email, password, role, branch_id) VALUES
-- Super Admin (no branch required)
('superadmin', 'admin@standrews.edu.gh', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', NULL),

-- Branch Admins
('admin.accra', 'admin.accra@standrews.edu.gh', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'branch_admin', 'accra'),
('admin.main', 'admin.main@standrews.edu.gh', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'branch_admin', 'assin_fosu'),

-- Staff members
('accountant1', 'accountant@standrews.edu.gh', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'accountant', 'assin_fosu'),
('transport1', 'transport@standrews.edu.gh', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'transport_manager', 'assin_fosu'),
('librarian1', 'library@standrews.edu.gh', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'librarian', 'assin_fosu'),

-- Students
('student001', 'student001@standrews.edu.gh', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'assin_fosu'),
('student002', 'student002@standrews.edu.gh', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'accra');