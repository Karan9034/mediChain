import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table'
import Web3 from 'web3';

const Insurer = ({mediChain, account, ethValue}) => {
    const [insurer, setInsurer] = useState(null);
    const [patList, setPatList] = useState([]);
    const [policyList, setPolicyList] = useState([]);
    const [polName, setPolName] = useState('');
    const [polCoverValue, setPolCoverValue] = useState('');
    const [polDuration, setPolDuration] = useState('');
    const [polPremium, setPolPremium] = useState('');
    const [showRecord, setShowRecord] = useState(false);
    const [claimsIdList, setClaimsIdList] = useState([]);
    const [claimsList, setClaimsList] = useState([]);

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
    const getClaimsData = async () => {
        var claimsIdList = await mediChain.methods.getInsurerClaims(account).call();
        let cl = [];
        for(let i=0; i<claimsIdList.length; i++){
            let claim = await mediChain.methods.claims(claimsIdList[i]).call();
            let patient = await mediChain.methods.patientInfo(claim.patient).call();
            let doctor = await mediChain.methods.doctorInfo(claim.doctor).call();
            claim = {...claim, id: claimsIdList[i], patientEmail: patient.email, doctorEmail: doctor.email, policyName: claim.policyName}
            cl = [...cl, claim];
        }
        setClaimsList(cl);
    }
    const approveClaim = async (e, claim) => {
        let value = claim.valueClaimed/ethValue;
        mediChain.methods.approveClaimsByInsurer(claim.id).send({from: account, value: Web3.utils.toWei(value.toString(), 'Ether')}).on('transactionHash', (hash) => {
            return window.location.href = '/login'
        })
    }
    const rejectClaim = async (e, claim) => {
        mediChain.methods.rejectClaimsByInsurer(claim.id).send({from: account}).on('transactionHash', (hash) => {
            return window.location.href = '/login'
        })
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
        if(claimsIdList.length === 0) getClaimsData();
    }, [insurer, patList, policyList, claimsIdList])


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
                    <Table striped bordered hover size="sm">
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
                                        <td>{pol.timePeriod} Year{pol.timePeriod >1 ? 's': ''}</td>
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
                                <th>Records</th>
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
                                            <td><Button className='btn-secondary' onClick={(e) => handleShowRecord(e, pat)} >View</Button></td>
                                        </tr>
                                    )
                                })
                                : <></>
                            }
                        </tbody>
                    </Table>
                </div>
                <div className='box'>
                    <h2>List of Claims</h2>
                    <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Patient Email</th>
                                <th>Doctor Email</th>
                                <th>Policy Name</th>
                                <th>Claim Value</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            { claimsList.length > 0 ?
                                claimsList.map((claim, idx) => {
                                    return (
                                        <tr key={idx+1}>
                                            <td>{idx+1}</td>
                                            <td>{claim.patientEmail}</td>
                                            <td>{claim.doctorEmail}</td>
                                            <td>{claim.policyName}</td>
                                            <td>INR {claim.valueClaimed}</td>
                                            <td>{!claim.approved && !claim.rejected ? "Pending" : !claim.approved ? "Rejected" : "Approved" }</td>
                                            <td>
                                                { !claim.approved && !claim.rejected ?
                                                    <>
                                                        <Button className='btn-success' onClick={(e) => approveClaim(e, claim)} >Approve</Button>
                                                        <Button className='btn-danger' onClick={(e) => rejectClaim(e, claim)} >Reject</Button>
                                                    </>
                                                :   <>
                                                        <Button className='btn-success' disabled >Approve</Button>
                                                        <Button className='btn-danger' disabled >Reject</Button>
                                                    </>
                                                }
                                            </td>
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


