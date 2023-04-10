import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table'
import Modal from 'react-bootstrap/Modal';


const Doctor = ({mediChain, account}) => {
  const [doctor, setDoctor] = useState(null);
  const [patient, setPatient] = useState(null);
  const [disease, setDisease] = useState('');
  const [treatment, setTreatment] = useState('');
  const [charges, setCharges] = useState('');
  const [patList, setPatList] = useState([]);
  const [showRecord, setShowRecord] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [transactionsList, setTransactionsList] = useState([]);

  const getDoctorData = async () => {
    var doctor = await mediChain.methods.doctorInfo(account).call();
    setDoctor(doctor);
  }
  const getPatientAccessList = async () => {
    var pat = await mediChain.methods.getDoctorPatientList(account).call();
    let pt = []
    for(let i=0; i<pat.length; i++){
      let patient = await mediChain.methods.patientInfo(pat[i]).call();
      patient = { ...patient, account:pat[i] }
      pt = [...pt, patient]
    }
    setPatList(pt);
  }
  const getTransactionsList = async () => {
    var transactionsIdList = await mediChain.methods.getDoctorTransactions(account).call();
    let tr = [];
    for(let i=0; i<transactionsIdList.length; i++){
        let transaction = await mediChain.methods.transactions(transactionsIdList[i]).call();
        let sender = await mediChain.methods.patientInfo(transaction.sender).call();
        if(!sender.exists) sender = await mediChain.methods.insurerInfo(transaction.sender).call();
        transaction = {...transaction, id: transactionsIdList[i], senderEmail: sender.email}
        tr = [...tr, transaction];
    }
    console.log(tr)
    setTransactionsList(tr);
  }


  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = async (patient) => {
    await setPatient(patient);
    await setShowModal(true);
  }
  const submitDiagnosis = () => {
    mediChain.methods.insuranceClaimRequest(patient.account, patient.record, charges).send({from: account}).on('transactionHash', (hash) => {
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
    if(!doctor) getDoctorData()
    if(patList.length === 0) getPatientAccessList();
    if(transactionsList.length === 0) getTransactionsList();
  }, [doctor, patList, transactionsList])


  return (
    <div>
      { doctor ?
        <>
          <div className='box'>
            <h2>Doctor's Profile</h2>
            <Form>
              <Form.Group>
                <Form.Label>Name: {doctor.name}</Form.Label>
              </Form.Group>
              <Form.Group>
                <Form.Label>Email: {doctor.email}</Form.Label>
              </Form.Group>
              <Form.Group>
                <Form.Label>Address: {account}</Form.Label>
              </Form.Group>
            </Form>
          </div>
          <div className='box'>
            <h2>List of Patient's Medical Records</h2>
            <Table id='records' striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>Patient Name</th>
                  <th>Patient Email</th>
                  <th>Action</th>
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
                        <td><Button onClick={(e) => handleShowModal(pat)} >Diagnose</Button></td>
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
            <h2>List of Transactions</h2>
              <Table striped bordered hover size="sm">
                <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Sender Email</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                  { transactionsList.length > 0 ? 
                    transactionsList.map((transaction, idx) => {
                      return (
                        <tr key={idx+1}>
                          <td>{idx+1}</td>
                          <td>{transaction.senderEmail}</td>
                          <td>{transaction.value}</td>
                          <td>{transaction.settled ? 'Settled' : "Pending"}</td>
                        </tr>
                      )
                    })
                    : <></>
                  }
                </tbody>
              </Table>
          </div>
          { patient ? <Modal id="modal" size="lg" centered show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title id="modalTitle">Enter diagnosis for: {patient.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                  <Form.Group className='mb-3'>
                    <Form.Label>Disease: </Form.Label>
                    <Form.Control required type="text" value={disease} onChange={(e) => setDisease(e.target.value)} placeholder='Enter disease'></Form.Control>
                  </Form.Group>
                  <Form.Group className='mb-3'>
                    <Form.Label>Treatment: </Form.Label>
                    <Form.Control required as="textarea" value={treatment} onChange={(e) => setTreatment(e.target.value)} placeholder='Enter the treatment in details'></Form.Control>
                  </Form.Group>
                  <Form.Group className='mb-3'>
                    <Form.Label>Medical Charges: </Form.Label>
                    <Form.Control required type="number" value={charges} onChange={(e) => setCharges(e.target.value)} placeholder='Enter medical charges incurred'></Form.Control>
                  </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
              <Button type="submit" variant="primary" onClick={submitDiagnosis}>
                Submit Diagnosis
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


export default Doctor


