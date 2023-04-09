import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table'
import { Link } from 'react-router-dom'
import Web3 from 'web3'


const Patient = ({mediChain, account, ethValue}) => {
  const [patient, setPatient] = useState(null);
  const [docEmail, setDocEmail] = useState("");
  const [docList, setDocList] = useState([]);
  const [insurer, setInsurer] = useState(null);
  const [insurerList, setInsurerList] = useState([]);
  const [buyFromInsurer, setBuyFromInsurer] = useState(null);
  const [policyList, setPolicyList] = useState([]);
  const [buyPolicyIndex, setBuyPolicyIndex] = useState(null);

  const getPatientData = async () => {
      var patient = await mediChain.methods.patientInfo(account).call();
      setPatient(patient);
      console.log(patient)
  }
  const giveAccess = (e) => {
    e.preventDefault();
    mediChain.methods.permitAccess(docEmail).send({from: account}).on('transactionHash', (hash) => {
      return window.location.href = '/login'
    })
  }
  const revokeAccess = async (email) => {
    var addr = await mediChain.methods.emailToAddress(email).call();
    mediChain.methods.revokeAccess(addr).send({from: account}).on('transactionHash', (hash) => {
      return window.location.href = '/login';
    });
  }
  const getDoctorAccessList = async () => {
    var doc = await mediChain.methods.getPatientDoctorList(account).call();
    let dt = [];
    for(let i=0; i<doc.length; i++){
      let doctor = await mediChain.methods.doctorInfo(doc[i]).call();
      dt = [...dt, doctor]
    }
    setDocList(dt)
  }
  const getInsurer = async () => {
    var insurer = await mediChain.methods.insurerInfo(patient.policy.insurer).call();
    setInsurer(insurer)
  }
  const getInsurerList = async () => {
    var ins = await mediChain.methods.getAllInsurersAddress().call();
    let it = [];
    for(let i=0; i<ins.length; i++){
      let insurer = await mediChain.methods.insurerInfo(ins[i]).call();
      insurer = {...insurer, account: ins[i]};
      it = [...insurerList, insurer]
    }
    setInsurerList(it)
  }
  const getPolicyList = async () => {
    var policyList = await mediChain.methods.getInsurerPolicyList(buyFromInsurer).call()
    setPolicyList(policyList);
    console.log(policyList)
  }
  const purchasePolicy = async (e) => {
    e.preventDefault();
    var value = policyList[buyPolicyIndex].premium/ethValue;
    console.log(value)
    mediChain.methods.buyPolicy(parseInt(policyList[buyPolicyIndex].id)).send({from: account, value: Web3.utils.toWei(value.toString(), 'Ether')}).on('transactionHash', (hash) => {
      return window.location.href = '/login'
    })
  }

  useEffect(() => {

    if(account === "") return window.location.href = '/login'
    if(!patient) getPatientData()
    if(docList.length === 0) getDoctorAccessList();
    if(patient?.policyActive) getInsurer();
    if(insurerList.length === 0) getInsurerList();
    if(policyList.length === 0 && buyFromInsurer) getPolicyList();
  }, [patient, docList, insurerList, buyFromInsurer])

  return (
    <div>
      { patient ?
        <>
          <div className='box'>
            <h2>Patient's Profile</h2>
            <Form>
              <Form.Group>
                <Form.Label>Name: {patient.name}</Form.Label>
              </Form.Group>
              <Form.Group>
                <Form.Label>Email address: {patient.email}</Form.Label>
              </Form.Group>
              <Form.Group>
                <Form.Label>Age: {patient.age}</Form.Label>
              </Form.Group>
              <Form.Group>
                <Form.Label>Address: {account}</Form.Label>
              </Form.Group>
            </Form>
            <div>
              <span>Your records are stored here: &nbsp; &nbsp;</span>
              <Link to={`${process.env.REACT_APP_INFURA_DEDICATED_GATEWAY}/${patient.record}`} target='_blank'><Button style={{width: "20%", height: "4vh"}} >View Records</Button></Link>
            </div>
          </div>
          <div className='box'>
            <h2>Share Your Medical Record with Doctor</h2>
            <Form onSubmit={giveAccess}>
              <Form.Group className="mb-3">
                <Form.Label>Email:</Form.Label>
                <Form.Control required type="email" value={docEmail} onChange={(e) => setDocEmail(e.target.value)} placeholder="Enter doctor's email"></Form.Control>
              </Form.Group>
              <Button variant="primary" type="submit">
                  Submit
              </Button>
            </Form>
          </div>
          <div className='box'>
            <h2>List of Doctor's you have given access to your medical records</h2>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Doctor's Name</th>
                  <th>Doctor's Email-ID</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                { docList.length > 0 ? 
                  docList.map((doc, idx) => {
                    return (
                      <tr key={idx}>
                        <td>{idx+1}</td>
                        <td>Dr. {doc.name}</td>
                        <td>{doc.email}</td>
                        <td><Button className='btn-danger' onClick={() => revokeAccess(doc.email)}>Revoke</Button></td>
                      </tr>
                    )
                  })
                  : <></>
                }
              </tbody>
            </Table>
          </div>
          <div className='box'>
            { patient.policyActive && insurer
              ?
              <>
                <h2>Insurance Policy Details</h2>
                <Form>
                  <Form.Group>
                    <Form.Label>Insurance Provider Name: {insurer.name}</Form.Label>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Email address: {insurer.email}</Form.Label>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Insurance Policy Name: {patient.policy.name}</Form.Label>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Insurance Duration: {patient.policy.timePeriod} Year{patient.policy.timePeriod >1 ? 's': ''}</Form.Label>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Cover Value: INR {patient.policy.coverValue}</Form.Label>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Premium: INR {patient.policy.premium}/year</Form.Label>
                  </Form.Group>
                </Form>
              </>
              :
              <>
                <h2>Buy Insurance Policy</h2>
                <Form onSubmit={purchasePolicy}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Select Insurance Provider:</Form.Label>
                    <Form.Select onChange={(e) => setBuyFromInsurer(e.target.value)}>
                      <option>Choose</option>
                      {
                        insurerList.length > 0
                        ? insurerList.map((ins, idx) => {
                          return <option key={idx} value={ins.account}>{ins.name}</option>
                        })
                        : <></>
                      }
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className='mb-3'>
                    <Form.Label>Select Insurance Policy:</Form.Label>
                    <Form.Select onChange={(e) => setBuyPolicyIndex(e.target.value)}>
                      <option>Choose</option>
                      {
                        policyList.length > 0
                        ? policyList.map((pol, idx) => {
                          return <option key={idx} value={idx}>{pol.name}</option>
                        })
                        : <></>
                      }
                    </Form.Select>
                  </Form.Group>
                  { policyList[buyPolicyIndex]
                    ? <div>
                        <p>Policy Name: {policyList[buyPolicyIndex].name}</p>
                        <p>Duration: {policyList[buyPolicyIndex].timePeriod} Year{policyList[buyPolicyIndex].timePeriod >1 ? 's': ''}</p>
                        <p>Cover Value: INR {policyList[buyPolicyIndex].coverValue}</p>
                        <p>Premium: INR {policyList[buyPolicyIndex].premium}/year</p>
                    </div>
                    : <></>
                  }
                  <Button type="submit">Buy Policy</Button>
                </Form>
              </>
            }
          </div>
        </>
        : <div>Loading...</div>
      }
    </div>
  )
}


export default Patient


