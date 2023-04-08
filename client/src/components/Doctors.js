import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table'
const Doctor = ({abc}) => {

    return (
        <div style={{ display: 'block', 
        width: 900, 
        padding: 100 }}>
<h4>Doctor's Dasboard</h4>
<Form>
<Form.Group>
<Form.Label>Name: Dr. Prachi Nandi</Form.Label>
</Form.Group>
<Form.Group>
<Form.Label>Enter your email address:</Form.Label>
</Form.Group>
<Form.Group>
<Form.Label>Enter your age:</Form.Label>
</Form.Group>

</Form>
<Table striped bordered hover size="sm">
      <thead>
        <tr>
          <th>S.NO</th>
          <th>Patient Name</th>
          <th>Patient Email-ID</th>
          <th>Disease</th>
          <th>E-prescription</th>
          <th>Send-prescription</th>
          <th>View Prescription</th>
        </tr>
      </thead>
      <tbody>
      <tr>
          <td>1</td>
          <td>Aish</td>
          <td>aish@gmail.com</td>
          <td>Depression: Suffering from chronic bipolar disorder. </td>
          <td><Form.Control type="text" 
              placeholder="Prescribe" /></td>
          <td> <Button/></td>
          <td>Depression: Suffering from chronic bipolar disorder. </td>
       
        </tr>
        <tr>
          <td>2</td>
          <td>Karan Agrawal</td>
          <td>prachinandi237@gmail.com</td>
          <td>Asthama : Due to excess smoking</td>
          <td><Form.Control type="text" 
              placeholder="Prescribe" /></td>
          <td> <Button/></td>
          <td>Depression: Suffering from chronic bipolar disorder. </td>
        </tr>
        
      </tbody>
    </Table>
</div>
    )
}


export default Doctor


