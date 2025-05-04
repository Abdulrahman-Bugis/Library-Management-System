import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import '../style.css';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

function CustomerDashboard() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
      } else {
        fetchBooks();
        fetchBorrowedBooks();
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchBooks = async () => {
    try {
      const booksSnapshot = await getDocs(collection(db, 'books'));
      const booksList = booksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBooks(booksList);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchBorrowedBooks = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'borrowedBooks'));
      const userEmail = auth.currentUser?.email;
      const borrowedList = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((entry) => entry.userEmail === userEmail);
      setBorrowedBooks(borrowedList);
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
    }
  };

  const getBookIdByTitle = (title) => {
    const book = books.find((b) => b.title === title);
    return book ? book.id : null;
  };

  const handleBorrowBook = async (bookId, title) => {
    const bookRef = doc(db, 'books', bookId);

    try {
      await updateDoc(bookRef, { available: false });

      const borrowedDate = Timestamp.fromDate(new Date());
      await addDoc(collection(db, 'borrowedBooks'), {
        bookTitle: title,
        userEmail: auth.currentUser.email,
        borrowedDate,
      });

      fetchBooks();
      fetchBorrowedBooks();
      alert('Book borrowed successfully!');
    } catch (error) {
      console.error('Error borrowing book:', error);
    }
  };

  const handleReturnBook = async (borrowedBookId, bookId) => {
    if (!bookId) {
      alert('Could not find the book ID.');
      return;
    }

    try {
      const borrowedRef = doc(db, 'borrowedBooks', borrowedBookId);
      const bookRef = doc(db, 'books', bookId);

      await deleteDoc(borrowedRef);
      await updateDoc(bookRef, { available: true });

      fetchBooks();
      fetchBorrowedBooks();
      alert('Book returned successfully!');
    } catch (error) {
      console.error('Error returning book:', error);
      alert('Failed to return book.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatDate = (timestamp) => {
    return timestamp?.toDate().toLocaleDateString() || '';
  };

  return (
    <div>
      <h1>Customer Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>

      <section>
        <h2>Available Books</h2>
        <ul>
          {books.map((book) => (
            <li key={book.id}>
              {book.title} by {book.author} ({book.genre}) -{' '}
              {book.available ? 'Available' : 'Borrowed'}
              {book.available && (
                <button onClick={() => handleBorrowBook(book.id, book.title)}>
                  Borrow
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Your Borrowed Books</h2>
        <ul>
          {borrowedBooks.map((borrowedBook) => (
            <li key={borrowedBook.id}>
              {borrowedBook.bookTitle} - Borrowed on: {formatDate(borrowedBook.borrowedDate)}
              <button
                onClick={() =>
                  handleReturnBook(
                    borrowedBook.id,
                    getBookIdByTitle(borrowedBook.bookTitle)
                  )
                }
              >
                Return Book
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default CustomerDashboard;
