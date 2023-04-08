import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table'
const Patient = ({abc}) => {

    return (
        <div style={{ display: 'block', 
        width: 1000, 
        padding: 100 }}>
<h4>Patient's Dasboard</h4>
<Form>
<Form.Group>
<Form.Label>Name: Karan Agrawal</Form.Label>
</Form.Group>
<Form.Group>
<Form.Label>Email address:</Form.Label>
</Form.Group>
<Form.Group>
<Form.Label>Enter your age:</Form.Label>
</Form.Group>

</Form>
<h4>List of Doctor's you have given access to your medical records</h4>
<Table striped bordered hover size="sm">
      <thead>
        <tr>
          <th>S.NO</th>
          <th>Dcotor's Name</th>
          <th>Doctor's Email-ID</th>
          <th>E-prescription</th>
          <th>Revoke Access</th>
          <th>Ask Querry</th>
          
        </tr>
      </thead>
      <tbody>
      <tr>
          <td>1</td>
          <td>Dr. Prachi Nandi</td>
          <td>abc@gmail.com</td>
          <td>Depression: Suffering from chronic bipolar disorder. </td>
          <td> <Button/></td>
          <td><Form.Control type="text" 
              placeholder="Prescribe" /></td>
         
       
        </tr>
        <tr>
        <td>1</td>
          <td>Dr. Prachi Nandi</td>
          <td>abc@gmail.com</td>
          <td>Depression: Suffering from chronic bipolar disorder. </td>
          <td> <Button/></td>
          <td><Form.Control type="text" 
              placeholder="Prescribe" /></td>
         
        </tr>
        
      </tbody>
    </Table>
</div>
    )
}


export default Patient


