import 'bootstrap/dist/css/bootstrap.min.css';
import { createContext, useReducer } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';
import { Container } from 'react-bootstrap';
import Home from './components/Home';
import MyUserReducer from './reducers/MyUserReducer'
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import ChangeProfile from './components/ChangeProfile';
import TourDetails from './components/TourDetails';
import Booking from './components/Booking';
import Cart from './components/Cart';
import Rating from './components/Rating';

export const MyUserContext = createContext();
export const MyDispatchContext = createContext();
export const MyCartContext = createContext();

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
          <BrowserRouter>
            <Header />
            <Container>
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/changeProfile' element={<ChangeProfile />} />
                <Route path='/tourDetails' element={<TourDetails />} />
                <Route path='/booking' element={<Booking />} />
                <Route path='/cart' element={<Cart />} />
                <Route path='/rating' element={<Rating />} />
              </Routes>
            </Container>
            <Footer />
          </BrowserRouter>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
  );
}

export default App;