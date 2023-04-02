import Identicon from 'identicon.js';
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, redirect } from 'react-router-dom';

const SiteNavbar = ({token, account, setAccount, setToken}) => {
    const logout = () => {
        setAccount('');
        setToken('')
        redirect('/');
    }
    return (
        <Navbar collapseOnSelect expand="md" variant="dark" bg='primary' fixed="top" className="site-navbar">
            <Container>
                <Navbar.Brand as={Link} to="/">MediChain</Navbar.Brand>
                <Nav justify>
                    { token!=='' ? 
                        <>
                            <Nav.Item>
                                <small className=''>
                                    {account.slice(0, 5)+ '...' + account.slice(-4)}
                                </small>
                            </Nav.Item>
                            <Nav.Item className='img'>
                                <img
                                    className='ml-2'
                                    width='40'
                                    height='40'
                                    src={`data:image/png;base64,${new Identicon(account, 40).toString()}`}
                                    alt="profile"
                                />
                            </Nav.Item>
                            <Nav.Item onClick={logout}>
                                <small className=''>
                                    Log Out
                                </small>
                            </Nav.Item>
                        </>
                        : 
                        <>
                            <Nav.Link as={Link} to="/login" >
                                <small className=''>
                                    Login
                                </small>
                            </Nav.Link>
                            <Nav.Link  as={Link} to="/register" >
                                <small className=''>
                                    Register
                                </small>
                            </Nav.Link>
                        </>
                    }
                </Nav>
            </Container>
        </Navbar>
    )
}


export default SiteNavbar
