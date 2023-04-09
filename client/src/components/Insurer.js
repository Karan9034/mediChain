import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table'
import Modal from 'react-bootstrap/Modal';


const Insurer = ({mediChain, account}) => {
    const [insurer, setInsurer] = useState(null);
    const [patList, setPatList] = useState([]);
    const [policyList, setPolicyList] = useState([]);
    const [polName, setPolName] = useState('');
    const [polCoverValue, setPolCoverValue] = useState('');
    const [polDuration, setPolDuration] = useState('');
    const [polPremium, setPolPremium] = useState('');
    const [showRecord, setShowRecord] = useState(false);

    const getInsurerData = async () => {
        var insurer = await mediChain.methods.insurerInfo(account).call();
        setInsurer(insurer);
    }
    const getPolicyList = async () => {
        var pol = await mediChain.methods.getInsurerPolicyList(account).call();
        setPolicyList(pol)
    }
    const createPolicy = (e) => {
        e.preventDefault()
        mediChain.methods.createPolicy(polName, polCoverValue, polDuration, polPremium).send({from: account}).on('transactionHash', (hash) => {
            return window.location.href = '/login'
        })
    }
    const getPatientList = async () => {
        var pat = await mediChain.methods.getInsurerPatientList(account).call();
        let pt = [];
        for(let i=0; i<pat.length; i++){
            let patient = await mediChain.methods.patientInfo(pat[i]).call();
            pt = [...pt, patient]
        }
        setPatList(pt)
    }


    const handleShowRecord = (e, pat) => {
        var table = document.getElementById('records');
        var idx = e.target.parentNode.parentNode.rowIndex;
        if(!showRecord){
            var row = table.insertRow(idx+1);
            row.innerHTML = "Yo"
            setShowRecord(true);
        }else{
            table.deleteRow(idx + 1);
            setShowRecord(false);
        }
    }

    useEffect(() => {
        if(account === "") return window.location.href = '/login'
        if(!insurer) getInsurerData()
        if(policyList.length === 0) getPolicyList();
        if(patList.length === 0) getPatientList();
    }, [insurer, patList, policyList])


    return (
        <div>
        { insurer ?
            <>
                <div className='box'>
                    <h2>Insurer's Profile</h2>
                    <Form>
                        <Form.Group>
                            <Form.Label>Name: {insurer.name}</Form.Label>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Email: {insurer.email}</Form.Label>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Address: {account}</Form.Label>
                        </Form.Group>
                    </Form>
                </div>
                <div className='box'>
                    <h2>Create New Insurance Policy</h2>
                    <Form>
                        <Form.Group className='mb-3'>
                            <Form.Label>Policy Name: </Form.Label>
                            <Form.Control required type="text" value={polName} onChange={(e) => setPolName(e.target.value)} placeholder='Enter disease'></Form.Control>
                        </Form.Group>
                        <Form.Group className='mb-3'>
                            <Form.Label>Cover Value: </Form.Label>
                            <Form.Control required type="number" value={polCoverValue} onChange={(e) => setPolCoverValue(e.target.value)} placeholder='Enter the treatment in details'></Form.Control>
                        </Form.Group>
                        <Form.Group className='mb-3'>
                            <Form.Label>Yearly Premium: </Form.Label>
                            <Form.Control required type="number" value={polPremium} onChange={(e) => setPolPremium(e.target.value)} placeholder='Enter medical charges incurred'></Form.Control>
                        </Form.Group>
                        <Form.Group className='mb-3'>
                            <Form.Label>Policy Period (in years): </Form.Label>
                            <Form.Control required type="number" max={3} min={1} value={polDuration} onChange={(e) => setPolDuration(e.target.value)} placeholder='Enter medical charges incurred'></Form.Control>
                        </Form.Group>
                        <Button type="submit" variant="primary" onClick={createPolicy}>
                            Create Policy
                        </Button>
                    </Form>
                </div>
                <div className='box'>
                    <h2>List of Policies</h2>
                    <Table id='records' striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Policy Name</th>
                                <th>Policy Cover</th>
                                <th>Policy Premium</th>
                                <th>Policy Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            { policyList.length > 0 ?
                                policyList.map((pol, idx) => {
                                    return (
                                    <tr key={idx+1}>
                                        <td>{idx+1}</td>
                                        <td>{pol.name}</td>
                                        <td>INR {pol.coverValue}</td>
                                        <td>INR {pol.premium}/year</td>
                                        <td>{pol.timePeriod} Years</td>
                                    </tr>
                                    )
                                })
                                : <></>
                            }
                        </tbody>
                    </Table>
                </div>
                <div className='box'>
                    <h2>List of Customers</h2>
                    <Table id='records' striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Customer Name</th>
                                <th>Customer Email</th>
                                <th>Policy Name</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            { patList.length > 0 ?
                                patList.map((pat, idx) => {
                                    return (
                                        <tr key={idx+1}>
                                            <td>{idx+1}</td>
                                            <td>{pat.name}</td>
                                            <td>{pat.email}</td>
                                            <td>{pat.policyActive ? pat.policy.name : "-"}</td>
                                            <td>{}</td>
                                        </tr>
                                    )
                                })
                                : <></>
                            }
                        </tbody>
                    </Table>
                </div>
            </>
            : <div>Loading...</div>
        }
        </div>
    )
}


export default Insurer


