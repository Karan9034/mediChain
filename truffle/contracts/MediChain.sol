// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract MediChain {
    // State Variables
    string public name;
    // uint public countPatients;
    // uint public countDoctors;
    // uint public countInsurer;
    // uint public countPolicy;
    address[] public patientList;
    address[] public doctorList;
    address[] public insurerList;
    Policy[] public policyList;
    uint public claimsCount;
    uint public transactionCount;
    mapping (uint => Claims) public claims;
    mapping (uint => Transactions) public transactions;
    mapping (address => Patient) public patientInfo;
    mapping (address => Doctor) public doctorInfo;
    mapping (address => Insurer) public insurerInfo;
    mapping (string => address) public emailToAddress;
    mapping (string => uint) public emailToDesignation;

    struct Patient {
        string name;
        string email;
        uint age;
        address[] doctorAccessList;
        string record;
        bool policyActive;
        Policy policy;
        uint[] transactions;
        bool exists;
    }
    struct Doctor {
        string name;
        string email;
        address[] patientAccessList;
        uint[] transactions;
        bool exists;
    }
    struct Insurer {
        string name;
        string email;
        Policy[] policies;
        address[] patients;
        uint[] claims;
        uint[] transactions;
        bool exists;
    }
    struct Policy {
        address insurer;
        string name;
        uint coverValue;
        uint timePeriod;
        uint premium;
    }
    struct Claims {
        address doctor;
        address patient;
        address insurer;
        string record;
        uint valueClaimed;
        bool approved;
        bool rejected;
        uint transactionId;
    }
    struct Transactions {
        address sender;
        address receiver;
        uint value;
        bool settled;
    }

    

    // event PatientAdded(
    //     string name,
    //     uint age,
    //     address[] doctorAccessList,
    //     uint[] diagnosis,
    //     string record
    // );
    // event DoctorAdded(
    //     string name,
    //     uint age,
    //     address[] patientAccessList
    // );
    // event InsurerAdded(
    //     string name,
    //     uint count_of_patient,
    //     address[] PatientWhoClaimed,
    //     address[] DocName,
    //     uint[] diagnosis
    // );
    

    

    constructor(){
        name = "medichain";
        // countPatients = 0;
        // countDoctors = 0;
        // countInsurer = 0;
        // countPolicy = 0;
        claimsCount = 0;
        transactionCount = 0;
    }

    function register(string memory _name, uint _age, uint _designation, string memory _email, string memory _hash) public {
        require(msg.sender != address(0));
        require(bytes(_name).length > 0);
        require(bytes(_email).length > 0);
        require(emailToAddress[_email] == address(0));
        require(emailToDesignation[_email] == 0);
        address _addr = msg.sender;
        if(_designation == 1){
            require(_age > 0);
            require(bytes(_hash).length > 0);
            require(!patientInfo[_addr].exists);
            patientInfo[_addr].name = _name;
            patientInfo[_addr].email = _email;
            patientInfo[_addr].age = _age;
            patientInfo[_addr].record = _hash;
            patientInfo[_addr].exists = true;
            patientList.push(_addr);
            emailToAddress[_email] = _addr;
            emailToDesignation[_email] = _designation;
        }
        else if (_designation == 2){
            require(!doctorInfo[_addr].exists);
            doctorInfo[_addr].name = _name;
            doctorInfo[_addr].email = _email;
            doctorInfo[_addr].exists = true;
            doctorList.push(_addr);
            emailToAddress[_email] = _addr;
            emailToDesignation[_email] = _designation;
        }
        else if(_designation == 3){
            require(!insurerInfo[_addr].exists);
            insurerInfo[_addr].name = _name;
            insurerInfo[_addr].email = _email;
            insurerInfo[_addr].exists = true;
            insurerList.push(_addr);
            emailToAddress[_email] = _addr;
            emailToDesignation[_email] = _designation;
        }
        else{
            revert();
        }
    }

    function login(address _addr) view public returns (uint){
        require(_addr != address(0));
        if(patientInfo[_addr].exists){
            return 1;
        }else if(doctorInfo[_addr].exists){
            return 2;
        }else if(insurerInfo[_addr].exists){
            return 3;
        }else{
            return 0;
        }
    }

    function getAllDoctorsAddress() view public returns (address[] memory) {
        return doctorList;
    }
    function getAllInsurersAddress() view public returns (address[] memory) {
        return insurerList;
    }
    function getAllPolicies() view public returns (Policy[] memory) {
        return policyList;
    }

    // Called By Patient
    function permitAccess(address _addr) public {
        require(_addr != address(0));
        require(msg.sender != address(0));
        require(patientInfo[msg.sender].exists);
        require(doctorInfo[_addr].exists);
        doctorInfo[_addr].patientAccessList.push(msg.sender);
        patientInfo[msg.sender].doctorAccessList.push(_addr);
    }

    // Called By Patient
    function buyPolicy(uint _id) payable public {
        require(_id >= 0 && _id < policyList.length);
        require(msg.sender != address(0));
        require(patientInfo[msg.sender].exists);
        require(msg.sender.balance >= msg.value);
        require(msg.value == policyList[_id].premium);
        payable(policyList[_id].insurer).transfer(msg.value);
        patientInfo[msg.sender].policy = policyList[_id];
        insurerInfo[policyList[_id].insurer].patients.push(msg.sender);
    }
    
    // Called by Patient
    function revokeAccess(address _addr) public{
        require(_addr != address(0));
        require(msg.sender != address(0));
        require(doctorInfo[_addr].exists);
        require(patientInfo[msg.sender].exists);
        removeFromList(doctorInfo[_addr].patientAccessList, msg.sender);
        removeFromList(patientInfo[msg.sender].doctorAccessList, _addr);
    }

    // Called by Patient
    function settleTransactionsByPatient(uint _id) payable public {
        require(msg.sender != address(0));
        require(patientInfo[msg.sender].exists);
        require(msg.sender == transactions[_id].sender);
        require(!transactions[_id].settled);
        address _addr = transactions[_id].receiver;
        uint value = transactions[_id].value;
        require(value == msg.value);
        require(doctorInfo[_addr].exists);
        payable(_addr).transfer(msg.value);
        transactions[_id].settled = true;
    }

    // Called by Doctor
    function insuarnceClaimRequest(address paddr, string memory _hash) payable public {
        require(msg.sender != address(0));
        require(paddr != address(0));
        require(doctorInfo[msg.sender].exists);
        require(patientInfo[paddr].exists);
        require(bytes(_hash).length > 0);
        bool patientFound = false;
        for(uint i = 0;i<doctorInfo[msg.sender].patientAccessList.length;i++){
            if(doctorInfo[msg.sender].patientAccessList[i]==paddr){
                patientFound = true;
            }
        }
        if(!patientFound){
            revert();
        }
        patientInfo[paddr].record = _hash;
        if(patientInfo[paddr].policyActive && patientInfo[paddr].policy.coverValue > 0){
            address iaddr = patientInfo[paddr].policy.insurer;
            if(patientInfo[paddr].policy.coverValue >= msg.value){
                transactionCount++;
                transactions[transactionCount] = Transactions(iaddr, msg.sender, msg.value, false);
                doctorInfo[msg.sender].transactions.push(transactionCount);
                insurerInfo[iaddr].transactions.push(transactionCount);
                patientInfo[paddr].policy.coverValue = patientInfo[paddr].policy.coverValue - msg.value;
                if(patientInfo[paddr].policy.coverValue==0){
                    patientInfo[paddr].policyActive = false;
                }
                claimsCount++;
                claims[claimsCount] = Claims(msg.sender, paddr, iaddr, _hash, msg.value, false, false, transactionCount);
                insurerInfo[iaddr].claims.push(claimsCount);
            }else{
                transactionCount++;
                transactions[transactionCount] = Transactions(paddr, msg.sender, msg.value-patientInfo[paddr].policy.coverValue, false);
                doctorInfo[msg.sender].transactions.push(transactionCount);
                patientInfo[paddr].transactions.push(transactionCount);
                transactionCount++;
                transactions[transactionCount] = Transactions(iaddr, msg.sender, patientInfo[paddr].policy.coverValue, false);
                doctorInfo[msg.sender].transactions.push(transactionCount);
                insurerInfo[iaddr].transactions.push(transactionCount);
                claimsCount++;
                claims[claimsCount] = Claims(msg.sender, paddr, iaddr, _hash, patientInfo[paddr].policy.coverValue, false, false, transactionCount);
                insurerInfo[iaddr].claims.push(claimsCount);
                patientInfo[paddr].policy.coverValue = 0;
                patientInfo[paddr].policyActive = false;
            }
        }else{
            transactionCount++;
            transactions[transactionCount] = Transactions(paddr, msg.sender, msg.value, false);
            doctorInfo[msg.sender].transactions.push(transactionCount);
            patientInfo[paddr].transactions.push(transactionCount);
        }
    }

    // Called By Insurer
    function createPolicy(string memory _name, uint _coverValue, uint _timePeriod, uint _premium) public {
        require(bytes(_name).length > 0);
        require(_coverValue > 0);
        require(_premium > 0);
        require(_timePeriod > 0);
        require(msg.sender != address(0));
        require(insurerInfo[msg.sender].exists);
        Policy memory pol = Policy(msg.sender, _name, _coverValue, _timePeriod, _premium);
        policyList.push(pol);
        insurerInfo[msg.sender].policies.push(pol);
    }

    // Called by Insurer
    function approveClaimsByInsurer(uint _id) payable public {
        require(msg.sender != address(0));
        require(insurerInfo[msg.sender].exists);
        require(msg.sender == claims[_id].insurer);
        require(!claims[_id].approved);
        require(!claims[_id].rejected);
        address _addr = claims[_id].doctor;
        uint value = claims[_id].valueClaimed;
        require(value == msg.value);
        require(doctorInfo[_addr].exists);
        payable(_addr).transfer(msg.value);
        claims[_id].approved = true;
        transactions[claims[_id].transactionId].settled = true;
    }

    // Called by Insurer
    function rejectClaimsByInsurer(uint _id) public {
        require(msg.sender != address(0));
        require(insurerInfo[msg.sender].exists);
        require(msg.sender == claims[_id].insurer);
        require(!claims[_id].approved);
        require(!claims[_id].rejected);
        address _addr = claims[_id].patient;
        require(patientInfo[_addr].exists);
        claims[_id].rejected = true;
        transactions[claims[_id].transactionId].sender = _addr;
    }

    function removeFromList(address[] storage Array, address addr) internal returns (uint){
        require(addr != address(0));
        bool check = false;
        uint del_index = 0;
        for(uint i = 0; i<Array.length; i++){
            if(Array[i] == addr){
                check = true;
                del_index = i;
            }
        }
        if(!check) revert();
        else{
            if(Array.length > 1){
                Array[del_index] = Array[Array.length - 1];
            }
            Array.pop();
        }
        return del_index;
    }
}
