import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import '../style.css';

function CustomerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
  
      try {
        const customerRef = doc(db, 'customers', user.uid);
        const customerSnap = await getDoc(customerRef);
  
        if (customerSnap.exists()) {
          const customerData = customerSnap.data();
  
          if (customerData.banned) {
            // Delay logout to allow alert to appear
            setTimeout(() => {
              alert('Your account has been banned.');
              signOut(auth).then(() => navigate('/login'));
            }, 100); // Slight delay for alert to render
            return;
          }
        } else {
          // If no customer document exists
          setTimeout(() => {
            alert('Account not found.');
            signOut(auth).then(() => navigate('/login'));
          }, 100);
          return;
        }
  
        // Passed ban check
        setUser(user);
        await fetchBooks();
        await fetchBorrowedBooks(user.email);
  
      } catch (error) {
        console.error('Error during ban check:', error);
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

  const fetchBorrowedBooks = async (email) => {
    try {
      const borrowedBooksSnapshot = await getDocs(collection(db, 'borrowedBooks'));
      const userBooks = borrowedBooksSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((book) => book.userEmail === email);
      setBorrowedBooks(userBooks);
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
    }
  };

  const handleBorrowBook = async (book) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'borrowedBooks'), {
        userEmail: user.email,
        bookTitle: book.title,
        borrowedDate: Timestamp.now(),
        bookId: book.id,
      });

      await updateDoc(doc(db, 'books', book.id), {
        available: false,
      });

      await fetchBooks();
      await fetchBorrowedBooks(user.email);
    } catch (error) {
      console.error('Error borrowing book:', error);
    }
  };

  const handleReturnBook = async (borrowedBook) => {
    try {
      await deleteDoc(doc(db, 'borrowedBooks', borrowedBook.id));

      if (borrowedBook.bookId) {
        await updateDoc(doc(db, 'books', borrowedBook.bookId), {
          available: true,
        });
      }

      await fetchBooks();
      await fetchBorrowedBooks(user.email);
    } catch (error) {
      console.error('Error returning book:', error);
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

  return (
    <div>
      <h1>Customer Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>

      <section>
        <h2>Available Books</h2>
        <ul>
          {books
            .filter((book) => book.available)
            .map((book) => (
              <li key={book.id}>
                {book.title} by {book.author} ({book.genre})
                <button onClick={() => handleBorrowBook(book)}>Borrow</button>
              </li>
            ))}
        </ul>
      </section>

      <section>
        <h2>My Borrowed Books</h2>
        <ul>
          {borrowedBooks.map((borrowed) => (
            <li key={borrowed.id}>
              {borrowed.bookTitle} <br />
              Borrowed Date:{' '}
              {borrowed.borrowedDate?.toDate().toLocaleDateString()} <br />
              <button onClick={() => handleReturnBook(borrowed)}>Return</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default CustomerDashboard;
