USE auth_system;

---- core user storage table--  

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  isVerified TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- stores OTP for email verification and forgot password.-- 

CREATE TABLE otp_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- table stores the user’s login sessions.-- 
CREATE TABLE sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token TEXT NOT NULL,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- see all database users --  
SELECT user, host FROM mysql.user;

select * from users;
select * from otp_requests;

-- delete user --  
delete from users where id in(27);
delete from otp_requests where id in(20,21);

-- drop column --  
ALTER TABLE users DROP COLUMN mobile;
-- alter users table add mobile (add column in table ) -- 
ALTER TABLE users ADD COLUMN mobile varchar(15) AFTER email;

-- alter table otp_requests (adding otp_request column) -- 
alter table otp_requests add column mobile varchar(15) after email;
-- update name -- 
UPDATE users SET name = 'ash' WHERE id = 33
-- alter table otp request ( adding resend_count) -- 
ALTER TABLE otp_requests 
ADD COLUMN resend_count INT DEFAULT 0,







 
