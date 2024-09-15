import { useContext, useEffect } from 'react';
import { Badge, Button, Container, Image, Nav, Navbar} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { MyDispatchContext, MyUserContext } from '../App';

const Header = () => {
    const user = useContext(MyUserContext)
    // const user = cookie.load("user")
    const dispatch = useContext(MyDispatchContext);
    useEffect(()=>{
        // cookie.save("user", null)
    })

    return (
        <>
        <Navbar expand="lg" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand href="#home">E-commerce Website</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <Link className='nav-link' to="/">Trang chủ</Link>

                    {user===null?<>
                        <Link className='nav-link text-success' to="/login">&#129489; Đăng nhập</Link>
                        <Link className='nav-link text-success' to="/register">&#129489; Đăng ký</Link>
                        
                        
                    </>:<>
                         <Link className='nav-link text-success' to="/profile">
                         <Image src={user.avatar} width="25" roundedCircle />
                              Chào {user.username}!</Link>
                        <Link className='nav-link text-danger' to="/cart">&#128722; <Badge bg='danger'></Badge></Link>
                    <Button variant='info' onClick={() => dispatch({"type": "logout"})}><Link to="/" className='nav-link'>Đăng xuất</Link></Button>
                    </>}
                </Nav>
                </Navbar.Collapse>
            </Container>
            </Navbar>
        </>
    );
}

export default Header;