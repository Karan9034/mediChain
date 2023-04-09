import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table'
import report from '../Images/report.png';
import { Link, useNavigate } from 'react-router-dom'


const Patient = ({mediChain, account}) => {
  const [patient, setPatient] = useState(null);
  const [docEmail, setDocEmail] = useState("");
  const [docList, setDocList] = useState([]);
  const navigate = useNavigate();

  const getPatientData = async () => {
      var patient = await mediChain.methods.patientInfo(account).call();
      setPatient(patient);
      console.log(patient)
  }
  const getDoctorAccessList = async () => {
    var doc = await mediChain.methods.getPatientDoctorList(account).call();
    let dt = [];
    for(let i=0; i<doc.length; i++){
      let doctor = await mediChain.methods.doctorInfo(doc[i]).call();
      dt = [...docList, doctor]
    }
    setDocList(dt)
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

  useEffect(() => {
    if(account === "") return window.location.href = '/login'
    if(!patient) getPatientData()
    if(docList.length === 0) getDoctorAccessList();
  }, [patient, docList])

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
          <h2>View Medical Diagnosis</h2>
          <img src={report} />
        </>
        : <div>Loading...</div>
      }
    </div>
  )
}


export default Patient


