import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { redirect } from 'react-router-dom';

const Register = ({mediChain, connectWallet, token, account}) => {
    const [designation, setDesignation] = useState("patient");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [age, setAge] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
    }

    useEffect(() => {
        if(token) redirect('/')
    }, [token])

    return (
        <div className='main'>
            <h2>Register</h2>
            <br />
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formDesignation">
                    <Form.Label>Designation</Form.Label>
                    <Form.Select onChange={(e) => setDesignation(e.target.value)} value={designation}>
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                        <option value="insurance">Insurance Provider</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
                </Form.Group>
                { designation!=="insurance" ?
                  <Form.Group className="mb-3" controlId="formAge">
                    <Form.Label>Age</Form.Label>
                    <Form.Control type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Enter your age" />
                  </Form.Group>
                  : <></>
                }
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


export default Register