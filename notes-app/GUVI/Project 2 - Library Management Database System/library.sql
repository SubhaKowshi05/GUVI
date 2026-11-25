-- Step 1
CREATE DATABASE LibraryDB;
USE LibraryDB;

-- Step 2
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    address VARCHAR(255),
    registered_date DATE DEFAULT (CURRENT_DATE)
);

-- Step 3
CREATE TABLE Books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    author VARCHAR(100),
    publisher VARCHAR(100),
    category VARCHAR(50),
    total_copies INT NOT NULL,
    available_copies INT NOT NULL,
    CHECK (total_copies >= 0),
    CHECK (available_copies >= 0),
    CHECK (available_copies <= total_copies)
);

-- Step 4
CREATE TABLE Transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) DEFAULT 'Issued',

    FOREIGN KEY (user_id)
        REFERENCES Users(user_id),

    FOREIGN KEY (book_id)
        REFERENCES Books(book_id),

    CHECK (due_date >= issue_date),
    CHECK (return_date IS NULL OR return_date >= issue_date),
    CHECK (status IN ('Issued', 'Returned'))
);

-- Step 5.1
INSERT INTO Users
(name, email, phone, address)
VALUES
('Kowshi', 'kowshi@gmail.com', '9876543210', 'Chennai'),
('Athini', 'athini@gmail.com', '9876543211', 'Coimbatore'),
('Daphne', 'daphne@gmail.com', '9876543212', 'Madurai');

-- Step 5.2
INSERT INTO Books
(title, author, publisher, category,
 total_copies, available_copies)
VALUES
('Python Programming', 'John Smith',
 'Tech Publications', 'Programming', 5, 5),

('Database Management', 'Raghu Ramakrishnan',
 'Pearson', 'Database', 3, 3),

('Java Programming', 'Herbert Schildt',
 'McGraw Hill', 'Programming', 4, 4);

 -- Query 1
 START TRANSACTION;

UPDATE Books
SET available_copies = available_copies - 1
WHERE book_id = 1
AND available_copies > 0;

INSERT INTO Transactions
(user_id, book_id, issue_date, due_date, status)
VALUES
(1, 1, CURDATE(),
 DATE_ADD(CURDATE(), INTERVAL 14 DAY),
 'Issued');
COMMIT;

-- Query 2
START TRANSACTION;

UPDATE Transactions
SET return_date = CURDATE(),
    status = 'Returned'
WHERE transaction_id = 1
AND status = 'Issued';

UPDATE Books
SET available_copies = available_copies + 1
WHERE book_id = 1;
COMMIT;

-- Query 3
SELECT *
FROM Books
WHERE available_copies > 0;

-- Query 4
SELECT
    T.transaction_id,
    U.name AS user_name,
    B.title AS book_title,
    T.issue_date,
    T.due_date
FROM Transactions T
JOIN Users U
    ON T.user_id = U.user_id
JOIN Books B
    ON T.book_id = B.book_id
WHERE T.status = 'Issued';

-- Query 5
SELECT
    U.name,
    B.title,
    T.issue_date,
    T.due_date
FROM Transactions T
JOIN Users U
    ON T.user_id = U.user_id
JOIN Books B
    ON T.book_id = B.book_id
WHERE T.status = 'Issued'
AND T.due_date < CURDATE();

-- Query 6
SELECT
    U.name,
    B.title,
    T.issue_date,
    T.return_date,
    T.status
FROM Transactions T
JOIN Users U
    ON T.user_id = U.user_id
JOIN Books B
    ON T.book_id = B.book_id
WHERE U.user_id = 1;

-- Query 7
SELECT
    U.name,
    COUNT(T.transaction_id) AS total_books_issued
FROM Users U
LEFT JOIN Transactions T
    ON U.user_id = T.user_id
GROUP BY U.user_id, U.name;

-- Query 8
SELECT *
FROM Books
WHERE title LIKE '%Python%';
