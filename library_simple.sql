-- =====================================================================
--  LIBRARY DATABASE  (beginner version)
--  Works in MySQL and MariaDB.  Only basic SQL is used:
--  CREATE TABLE, INSERT, UPDATE, SELECT, JOIN.
--
--  HOW TO RUN
--    1. mysql -u root -p -e "CREATE DATABASE library"
--    2. mysql -u root -p library < library_simple.sql
--  Or open this file in MySQL Workbench and press the lightning-bolt button.
-- =====================================================================


-- =====================================================================
-- PART 1 : CREATE THE TABLES
-- =====================================================================

-- Start fresh (delete old tables if they exist)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS users;

-- Table 1: books  (one row per book title)
CREATE TABLE books (
    book_id           INT PRIMARY KEY AUTO_INCREMENT,
    title             VARCHAR(100) NOT NULL,
    author            VARCHAR(100) NOT NULL,
    copies_available  INT NOT NULL            -- how many copies are on the shelf now
);

-- Table 2: users  (one row per library member)
CREATE TABLE users (
    user_id  INT PRIMARY KEY AUTO_INCREMENT,
    name     VARCHAR(100) NOT NULL,
    email    VARCHAR(100) NOT NULL
);

-- Table 3: transactions  (one row every time a book is issued)
--   book_id and user_id are FOREIGN KEYS: they link a transaction
--   to one book and one user.
--   return_date stays NULL (empty) until the book is brought back.
CREATE TABLE transactions (
    txn_id       INT PRIMARY KEY AUTO_INCREMENT,
    book_id      INT NOT NULL,
    user_id      INT NOT NULL,
    issue_date   DATE NOT NULL,
    due_date     DATE NOT NULL,
    return_date  DATE,
    fine         INT NOT NULL DEFAULT 0,
    FOREIGN KEY (book_id) REFERENCES books(book_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);


-- =====================================================================
-- PART 2 : ADD SOME SAMPLE DATA
-- =====================================================================

INSERT INTO books (title, author, copies_available) VALUES
    ('Effective Java', 'Joshua Bloch',     2),   -- book_id 1
    ('Clean Code',     'Robert C. Martin', 2),   -- book_id 2
    ('1984',           'George Orwell',    1),   -- book_id 3
    ('Cosmos',         'Carl Sagan',       1);   -- book_id 4

INSERT INTO users (name, email) VALUES
    ('Asha Kumar', 'asha@example.com'),          -- user_id 1
    ('Ravi Menon', 'ravi@example.com'),          -- user_id 2
    ('Meena Iyer', 'meena@example.com');         -- user_id 3

-- Look at what we added
SELECT * FROM books;
SELECT * FROM users;


-- =====================================================================
-- PART 3 : ISSUE BOOKS
-- Issuing a book = 2 steps:
--   (a) add a row to transactions
--   (b) reduce copies_available of that book by 1
-- Loan period is 14 days.
-- =====================================================================

-- Asha (user 1) borrows Effective Java (book 1) on 1 Nov, due 15 Nov
INSERT INTO transactions (book_id, user_id, issue_date, due_date)
VALUES (1, 1, '2026-11-01', '2026-11-15');
UPDATE books SET copies_available = copies_available - 1 WHERE book_id = 1;

-- Ravi (user 2) borrows Clean Code (book 2) on 5 Nov, due 19 Nov
INSERT INTO transactions (book_id, user_id, issue_date, due_date)
VALUES (2, 2, '2026-11-05', '2026-11-19');
UPDATE books SET copies_available = copies_available - 1 WHERE book_id = 2;

-- Meena (user 3) borrows 1984 (book 3) on 10 Nov, due 24 Nov
INSERT INTO transactions (book_id, user_id, issue_date, due_date)
VALUES (3, 3, '2026-11-10', '2026-11-24');
UPDATE books SET copies_available = copies_available - 1 WHERE book_id = 3;

-- Asha also borrows Cosmos (book 4) on 1 Nov, due 15 Nov (she will NOT return it yet)
INSERT INTO transactions (book_id, user_id, issue_date, due_date)
VALUES (4, 1, '2026-11-01', '2026-11-15');
UPDATE books SET copies_available = copies_available - 1 WHERE book_id = 4;

-- Which books are out right now?  (return_date is empty = still borrowed)
SELECT t.txn_id, u.name AS borrower, b.title, t.issue_date, t.due_date
FROM transactions t
JOIN users u ON u.user_id = t.user_id
JOIN books b ON b.book_id = t.book_id
WHERE t.return_date IS NULL;

-- How many copies are left on the shelf?
SELECT title, copies_available FROM books;


-- =====================================================================
-- PART 4 : RETURN BOOKS
-- Returning a book = 2 steps:
--   (a) fill in return_date (and fine, if late)
--   (b) increase copies_available of that book by 1
-- Fine rule: 2 rupees for every day after the due date.
-- =====================================================================

-- Asha returns Effective Java on 14 Nov (due 15 Nov) -> on time, no fine
UPDATE transactions SET return_date = '2026-11-14' WHERE txn_id = 1;
UPDATE books SET copies_available = copies_available + 1 WHERE book_id = 1;

-- Ravi returns Clean Code on 22 Nov (due 19 Nov) -> 3 days late
-- fine = 3 days x 2 = 6
UPDATE transactions
SET return_date = '2026-11-22',
    fine = DATEDIFF('2026-11-22', due_date) * 2
WHERE txn_id = 2;
UPDATE books SET copies_available = copies_available + 1 WHERE book_id = 2;

-- Check the transactions again
SELECT txn_id, book_id, user_id, due_date, return_date, fine FROM transactions;


-- =====================================================================
-- PART 5 : TRACK BOOKS  (handy reports)
-- =====================================================================

-- 5.1  Full borrowing history
SELECT u.name AS borrower, b.title, t.issue_date, t.due_date, t.return_date, t.fine
FROM transactions t
JOIN users u ON u.user_id = t.user_id
JOIN books b ON b.book_id = t.book_id
ORDER BY t.txn_id;

-- 5.2  Overdue books (not returned and the due date has passed)
SELECT u.name AS borrower, b.title, t.due_date,
       DATEDIFF(CURDATE(), t.due_date) AS days_overdue
FROM transactions t
JOIN users u ON u.user_id = t.user_id
JOIN books b ON b.book_id = t.book_id
WHERE t.return_date IS NULL AND t.due_date < CURDATE();

-- 5.3  Total fine owed by each user
SELECT u.name, SUM(t.fine) AS total_fine
FROM users u
JOIN transactions t ON t.user_id = u.user_id
GROUP BY u.name;

-- 5.4  How many books has each user borrowed so far?
SELECT u.name, COUNT(t.txn_id) AS books_borrowed
FROM users u
LEFT JOIN transactions t ON t.user_id = u.user_id
GROUP BY u.name;

-- 5.5  Search for a book by title
SELECT * FROM books WHERE title LIKE '%Code%';
