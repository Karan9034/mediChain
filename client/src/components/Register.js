import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Buffer } from 'buffer';

const Register = ({mediChain, ipfs, connectWallet, token, account, setToken, setAccount}) => {
    const [designation, setDesignation] = useState("1");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [age, setAge] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if(account!=="" && designation==="1"){
            var record = Buffer(JSON.stringify({
                name: name,
                email: email,
                address: account,
                age: age,
                treatments: []
            }));
            ipfs.add(record).then((result, error) => {
                if(error){
                    console.log(error);
                    return;
                }else{
                    mediChain.methods.register(name, age, parseInt(designation), email, result.path).send({from: account}).on('transactionHash', async (hash) => {
                        window.location.href = '/login'
                    })
                }
            })
        }else if(account!==""){
            mediChain.methods.register(name, 0, parseInt(designation), email, "").send({from: account}).on('transactionHash', async (hash) => {
                window.location.href = '/login'
            })
        }
    }

    useEffect(() => {
        var t = localStorage.getItem('token')
        var a = localStorage.getItem('account')
        t = t ? t : ""
        a = a ? a : ""
        if(t!=="" && a!=="") window.location.href = '/login';
        else{
            localStorage.removeItem('token')
            localStorage.removeItem('account')
            setToken('');
            setAccount('');
        }
    }, [token])

    return (
        <div className='register'>
            <div className='box'>
                <h2>Register</h2>
                <br />
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formWallet">
                        <Form.Label>Connect Wallet</Form.Label>
                        { account === "" ?
                        <Form.Control type="button" value="Connect to Metamask" onClick={connectWallet}/>
                        : <Form.Control type="button" disabled value={`Connected Wallet with Address: ${account}`}/>
                        }
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formDesignation">
                        <Form.Label>Designation</Form.Label>
                        <Form.Select onChange={(e) => setDesignation(e.target.value)} value={designation}>
                            <option value="1">Patient</option>
                            <option value="2">Doctor</option>
                            <option value="3">Insurance Provider</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
                    </Form.Group>
                    { designation==="1" ?
                    <Form.Group className="mb-3" controlId="formAge">
                        <Form.Label>Age</Form.Label>
                        <Form.Control type="number" value={age} min={18} onChange={(e) => setAge(e.target.value)} placeholder="Enter your age" />
                    </Form.Group>
                    : <></>
                    }
                    <Button variant="coolColor" type="submit">
                        Submit
                    </Button>
                </Form>
            </div>
        </div>
    )
}


export default Register