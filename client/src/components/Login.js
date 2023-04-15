import { useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Login = ({mediChain, connectWallet, token, account, setToken, setAccount}) => {
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(account==="") return;
        var res = await mediChain.methods.patientInfo(account).call()
        if(res.exists){
            setToken('1');
            localStorage.setItem('token', '1');
            localStorage.setItem('account', account);
            return navigate('/dashboard')
        }
        res = await mediChain.methods.doctorInfo(account).call()
        if(res.exists){
            setToken('2');
            localStorage.setItem('token', '2');
            localStorage.setItem('account', account);
            return navigate('/dashboard')
        }
        res = await mediChain.methods.insurerInfo(account).call()
        if(res.exists){
            setToken('3');
            localStorage.setItem('token', '3');
            localStorage.setItem('account', account);
            return navigate('/dashboard')
        }
        localStorage.removeItem('token')
        localStorage.removeItem('account')
        setToken('');
        setAccount('');
    }

    useEffect(() => {
        if(mediChain){   
            var t = localStorage.getItem('token')
            var a = localStorage.getItem('account')
            t = t ? t : ""
            a = a ? a : ""
            if((t!=="" || a!=="") && (a===account || account==='')){
                if(t==="1"){
                    mediChain.methods.patientInfo(a).call().then((res) => {
                        if(res.exists){
                            setToken(t);
                            setAccount(a);            
                            return navigate('/dashboard')
                        }else{
                            localStorage.removeItem('token')
                            localStorage.removeItem('account')
                            setToken('');
                            setAccount('');
                        }
                    })
                }else if(t==="2"){
                    mediChain.methods.doctorInfo(a).call().then((res) => {
                        if(res.exists){
                            setToken(t);
                            setAccount(a);
                            return navigate('/dashboard')
                        }else{
                            localStorage.removeItem('token')
                            localStorage.removeItem('account')
                            setToken('');
                            setAccount('');
                        }
                    })
                }else if(t==="3"){
                    mediChain.methods.insurerInfo(a).call().then((res) => {
                        if(res.exists){
                            setToken(t);
                            setAccount(a);
                            return navigate('/dashboard')
                        }else{
                            localStorage.removeItem('token')
                            localStorage.removeItem('account')
                            setToken('');
                            setAccount('');
                        }
                    })
                }
            }
        }
    }, [mediChain])

    return (
        <div className='login'>
            <div className='box'>
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
                    <Button variant="coolColor" type="submit">
                        Submit
                    </Button>
                </Form>
            </div>
        </div>
    )
}


export default Login