import { useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { redirect } from 'react-router-dom';

const Login = ({mediChain, connectWallet, token, account, setToken, setAccount}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
    }

    useEffect(() => {
        if(token && account) redirect('/');
        else{
            setToken('');
            setAccount('');
        }
    }, [])

    return (
        <div className='main'>
            <h2>Login</h2>
            <br />
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formWallet">
                    <Form.Label>Connect Wallet</Form.Label>
                    { account === "" ?
                      <Form.Control type="button" value="Connect to Metamask" onClick={connectWallet}/>
                    : <Form.Control type="button" disabled value={`Connected Wallet with Address: ${account}`}/>
                    }
                </Form.Group>
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
        </div>
    )
}


export default Login