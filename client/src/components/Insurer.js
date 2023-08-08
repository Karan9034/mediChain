import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Web3 from 'web3';
import {Link} from 'react-router-dom'

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
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [patientRecord, setPatientRecord] = useState(null);
  
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
    const handleCloseRecordModal = () => setShowRecordModal(false);
    const handleShowRecordModal = async (e, patient) => {
        var record = {}
        await fetch(`${process.env.REACT_APP_INFURA_DEDICATED_GATEWAY}/ipfs/${patient.record}`)
            .then(res => res.json())
            .then(data => record = data)
        await setPatientRecord(record);
        await setShowRecordModal(true);
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
        for(let i=claimsIdList.length-1; i>=0; i--){
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
                            <Form.Control required type="text" value={polName} onChange={(e) => setPolName(e.target.value)} placeholder='Enter policy name'></Form.Control>
                        </Form.Group>
                        <Form.Group className='mb-3'>
                            <Form.Label>Cover Value: </Form.Label>
                            <Form.Control required type="number" value={polCoverValue} onChange={(e) => setPolCoverValue(e.target.value)} placeholder='Enter the cover value in INR'></Form.Control>
                        </Form.Group>
                        <Form.Group className='mb-3'>
                            <Form.Label>Yearly Premium: </Form.Label>
                            <Form.Control required type="number" value={polPremium} onChange={(e) => setPolPremium(e.target.value)} placeholder='Enter the annual premium in INR'></Form.Control>
                        </Form.Group>
                        <Form.Group className='mb-3'>
                            <Form.Label>Policy Period (in years): </Form.Label>
                            <Form.Control required type="number" max={3} min={1} value={polDuration} onChange={(e) => setPolDuration(e.target.value)} placeholder='Enter policy duration'></Form.Control>
                        </Form.Group>
                        <Button type="submit" variant="coolColor" onClick={createPolicy}>
                            Create Policy
                        </Button>
                    </Form>
                </div>
                <div className='box'>
                    <h2>List of Policies</h2>
                    <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>Sr.&nbsp;No.</th>
                                <th>Policy&nbsp;Name</th>
                                <th>Policy&nbsp;Cover</th>
                                <th>Policy&nbsp;Premium</th>
                                <th>Policy&nbsp;Duration</th>
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
                                <th>Sr.&nbsp;No.</th>
                                <th>Customer&nbsp;Name</th>
                                <th>Customer&nbsp;Email</th>
                                <th>Policy&nbsp;Name</th>
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
                                            <td><Button variant="coolColor" onClick={(e) => handleShowRecordModal(e, pat)} >View</Button></td>
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
                                <th>Sr.&nbsp;No.</th>
                                <th>Patient&nbsp;Email</th>
                                <th>Doctor&nbsp;Email</th>
                                <th>Policy&nbsp;Name</th>
                                <th>Claim&nbsp;Value</th>
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
                                            <td>{!claim.approved && !claim.rejected ? <span className='badge rounded-pill bg-warning'>Pending</span> : !claim.approved ? <span className='badge rounded-pill bg-danger'>Rejected</span>  : <span className='badge rounded-pill bg-success'>Accepted</span>  }</td>
                                            <td>
                                                { !claim.approved && !claim.rejected ?
                                                    <DropdownButton title="Action" variant='coolColor'>
                                                        <Dropdown.Item onClick={(e) => approveClaim(e, claim)} >Approve</Dropdown.Item>
                                                        <Dropdown.Item onClick={(e) => rejectClaim(e, claim)} >Reject</Dropdown.Item>
                                                    </DropdownButton>
                                                :   <>
                                                        <DropdownButton title="Action" disabled variant='coolColor'>
                                                            <Dropdown.Item onClick={(e) => approveClaim(e, claim)} >Approve</Dropdown.Item>
                                                            <Dropdown.Item onClick={(e) => rejectClaim(e, claim)} >Reject</Dropdown.Item>
                                                        </DropdownButton>
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
                    { patientRecord ? <Modal id="modal" size="lg" centered show={showRecordModal} onHide={handleCloseRecordModal}>
                        <Modal.Header closeButton>
                            <Modal.Title id="modalTitle">Medical Record:</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                            <Form.Group>
                                <Form.Label>Patient Name: {patientRecord.name}</Form.Label>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Patient Email: {patientRecord.email}</Form.Label>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Patient Age: {patientRecord.age}</Form.Label>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Address: {patientRecord.address}</Form.Label>
                            </Form.Group>
                            <Table id='records' striped bordered hover size="sm">
                                <thead>
                                    <tr>
                                        <th>Sr.&nbsp;No.</th>
                                        <th>Doctor&nbsp;Email</th>
                                        <th>Date</th>
                                        <th>Disease</th>
                                        <th>Treatment</th>
                                        <th>Prescription</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { patientRecord.treatments.length > 0 ?
                                        patientRecord.treatments.map((treatment, idx) => {
                                            return (
                                            <tr key={idx+1}>
                                                <td>{idx+1}</td>
                                                <td>{treatment.doctorEmail}</td>
                                                <td>{treatment.date}</td>
                                                <td>{treatment.disease}</td>
                                                <td>{treatment.treatment}</td>
                                                <td>
                                                    { treatment.prescription ? 
                                                        <Link to={`${process.env.REACT_APP_INFURA_DEDICATED_GATEWAY}/ipfs/${treatment.prescription}`} target="_blank"><Button variant="coolColor">View</Button></Link>
                                                        : "No document uploaded"
                                                    }
                                                </td>
                                            </tr>
                                            )
                                        })
                                        : <></>
                                    }
                                </tbody>
                            </Table>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseRecordModal}>
                            Close
                        </Button>
                        </Modal.Footer>
                    </Modal> : <></>
                    }
                </>
                : <div>Loading...</div>
            }
        </div>
    )
}


export default Insurer


