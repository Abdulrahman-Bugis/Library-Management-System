import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import '../style.css';


function AdminDashboard() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [newBook, setNewBook] = useState({ title: '', author: '', genre: '' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user || user.email !== 'test@test.com') {
        navigate('/login');
      }
    });

    fetchBooks();
    fetchCustomers();
    fetchBorrowedBooks();

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

  const fetchCustomers = async () => {
    try {
      const customersSnapshot = await getDocs(collection(db, 'customers'));
      const customersList = customersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCustomers(customersList);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchBorrowedBooks = async () => {
    try {
      const borrowedBooksSnapshot = await getDocs(collection(db, 'borrowedBooks'));
      const borrowedBooksList = borrowedBooksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBorrowedBooks(borrowedBooksList);
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
    }
  };

  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author || !newBook.genre) {
      alert('Please fill out all fields!');
      return;
    }

    try {
      await addDoc(collection(db, 'books'), {
        title: newBook.title,
        author: newBook.author,
        genre: newBook.genre,
        available: true,
      });
      setNewBook({ title: '', author: '', genre: '' });
      setIsAdding(false);
      fetchBooks();
      alert('Book added successfully!');
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      await deleteDoc(doc(db, 'books', bookId));
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleBanCustomer = async (customerId, isBanned) => {
    try {
      await updateDoc(doc(db, 'customers', customerId), {
        banned: !isBanned,
      });
      fetchCustomers();
    } catch (error) {
      console.error('Error updating customer status:', error);
    }
  };

  const handleRemoveCustomer = async (customerId) => {
    try {
      await deleteDoc(doc(db, 'customers', customerId));
      fetchCustomers();
    } catch (error) {
      console.error('Error removing customer:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatReturnDate = (returnDate) => {
    if (!returnDate) return '';
    if (returnDate instanceof Timestamp) {
      const date = returnDate.toDate();
      return date.toLocaleDateString();
    } else {
      return returnDate;
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>

      <section>
        <h2>Books ({books.length})</h2>
        <ul>
          {books.map((book) => (
            <li key={book.id}>
              {book.title} by {book.author} ({book.genre}) - {book.available ? 'Available' : 'Borrowed'}
              <button onClick={() => handleDeleteBook(book.id)}>Delete</button>
            </li>
          ))}
        </ul>

        {!isAdding ? (
          <button onClick={() => setIsAdding(true)}>Add New Book</button>
        ) : (
          <div className="add-book-form">
            <h3>Add New Book</h3>
            <input
              type="text"
              placeholder="Title"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Author"
              value={newBook.author}
              onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
            />
            <input
              type="text"
              placeholder="Genre"
              value={newBook.genre}
              onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
            />
            <button onClick={handleAddBook}>Add Book</button>
            <button onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        )}
      </section>

      <section>
        <h2>Customers ({customers.length})</h2>
        <ul>
          {customers.map((customer) => (
            <li key={customer.id}>
              {customer.name} ({customer.email}) - {customer.banned ? 'Banned' : 'Active'}
              <button onClick={() => handleBanCustomer(customer.id, customer.banned)}>
                {customer.banned ? 'Unban' : 'Ban'}
              </button>
              <button onClick={() => handleRemoveCustomer(customer.id)}>Remove</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Borrowed Books ({borrowedBooks.length})</h2>
        <ul>
          {borrowedBooks.map((borrowedBook) => (
            <li key={borrowedBook.id}>
              Book: {borrowedBook.bookTitle} <br />
              Borrowed By: {borrowedBook.userEmail} <br />
              Borrowed Date: {formatReturnDate(borrowedBook.borrowedDate)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default AdminDashboard;
