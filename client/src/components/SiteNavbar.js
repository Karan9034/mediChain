import Identicon from 'identicon.js';
import { Container, Nav, Navbar } from "react-bootstrap";

const SiteNavbar = ({account, setAccount, setCurrPage}) => {
    const logout = () => {
        setAccount('');
        setCurrPage('home');
    }
    return (
        <Navbar collapseOnSelect expand="md" variant="dark" bg='dark' fixed="top" className="site-navbar">
            <Container>
                <Navbar.Brand onClick={()=>{}}>AppName</Navbar.Brand>
                <Nav justify>
                    { account!=='' ? 
                        <>
                            <Nav.Item>
                                <small className='text-secondary'>
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
                            <Nav.Item onClick={()=> logout()}>
                                <small className='text-secondary'>
                                    Log Out
                                </small>
                            </Nav.Item>
                        </>
                        : 
                        <>
                            <Nav.Link onClick={() => setCurrPage('login')}>
                                <small className='text-secondary'>
                                    Login
                                </small>
                            </Nav.Link>
                            <Nav.Link onClick={() => setCurrPage('register')}>
                                <small className='text-secondary'>
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
