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
        string record;
        bool exists;
        bool policyActive;
        Policy policy;
        uint[] transactions;
        address[] doctorAccessList;
    }
    struct Doctor {
        string name;
        string email;
        bool exists;
        uint[] transactions;
        address[] patientAccessList;
    }
    struct Insurer {
        string name;
        string email;
        bool exists;
        Policy[] policies;
        address[] patients;
        uint[] claims;
        uint[] transactions;
    }
    struct Policy {
        uint id;
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
        string policyName;
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

    

    

    

    constructor(){
        name = "medichain";
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
        require(!patientInfo[_addr].exists);
        require(!doctorInfo[_addr].exists);
        require(!insurerInfo[_addr].exists);
        if(_designation == 1){
            require(_age > 0);
            require(bytes(_hash).length > 0);
            Patient storage pinfo = patientInfo[_addr];
            pinfo.name = _name;
            pinfo.email = _email;
            pinfo.age = _age;
            pinfo.record = _hash;
            pinfo.exists = true;
            pinfo.doctorAccessList;
            patientList.push(_addr);
            emailToAddress[_email] = _addr;
            emailToDesignation[_email] = _designation;
        }
        else if (_designation == 2){
            Doctor storage dinfo = doctorInfo[_addr];
            dinfo.name = _name;
            dinfo.email = _email;
            dinfo.exists = true;
            doctorList.push(_addr);
            emailToAddress[_email] = _addr;
            emailToDesignation[_email] = _designation;
        }
        else if(_designation == 3){
            Insurer storage iinfo = insurerInfo[_addr];
            iinfo.name = _name;
            iinfo.email = _email;
            iinfo.exists = true;
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


    function getPatientDoctorList(address _addr) view public returns (address[] memory){
        require(_addr != address(0));
        require(patientInfo[_addr].exists);
        return (patientInfo[_addr].doctorAccessList);
    }
    function getDoctorPatientList(address _addr) view public returns (address[] memory){
        require(_addr != address(0));
        require(doctorInfo[_addr].exists);
        return (doctorInfo[_addr].patientAccessList);
    }
    function getInsurerPolicyList(address _addr) view public returns (Policy[] memory) {
        require(_addr != address(0));
        require(insurerInfo[_addr].exists);
        return (insurerInfo[_addr].policies);
    }
    function getInsurerPatientList(address _addr) view public returns (address[] memory){
        require(_addr != address(0));
        require(insurerInfo[_addr].exists);
        return (insurerInfo[_addr].patients);
    }
    function getInsurerClaims(address _addr) view public returns (uint[] memory){
        require(_addr != address(0));
        require(insurerInfo[_addr].exists);
        return (insurerInfo[_addr].claims);
    }
    function getPatientTransactions(address _addr) view public returns (uint[] memory){
        require(_addr != address(0));
        require(patientInfo[_addr].exists);
        return (patientInfo[_addr].transactions);
    }
    function getDoctorTransactions(address _addr) view public returns (uint[] memory){
        require(_addr != address(0));
        require(doctorInfo[_addr].exists);
        return (doctorInfo[_addr].transactions);
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
    function permitAccess(string memory _email) public {
        require(bytes(_email).length > 0);
        require(msg.sender != address(0));
        address _addr = emailToAddress[_email];
        require(_addr != address(0));
        require(patientInfo[msg.sender].exists);
        require(doctorInfo[_addr].exists);
        Doctor storage dinfo = doctorInfo[_addr];
        Patient storage pinfo = patientInfo[msg.sender];
        dinfo.patientAccessList.push(msg.sender);
        pinfo.doctorAccessList.push(_addr);
    }

    // Called By Patient
    function buyPolicy(uint _id) payable public {
        require(_id >= 0 && _id < policyList.length);
        require(msg.sender != address(0));
        require(patientInfo[msg.sender].exists);
        require(msg.sender.balance >= msg.value);
        payable(policyList[_id].insurer).transfer(msg.value);
        patientInfo[msg.sender].policy.id = policyList[_id].id;
        patientInfo[msg.sender].policy.name = policyList[_id].name;
        patientInfo[msg.sender].policy.coverValue = policyList[_id].coverValue;
        patientInfo[msg.sender].policy.insurer = policyList[_id].insurer;
        patientInfo[msg.sender].policy.timePeriod = policyList[_id].timePeriod;
        patientInfo[msg.sender].policy.premium = policyList[_id].premium;
        patientInfo[msg.sender].policyActive = true;
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
        require(doctorInfo[_addr].exists);
        payable(_addr).transfer(msg.value);
        transactions[_id].settled = true;
    }

    // Called by Doctor
    function insuranceClaimRequest(address paddr, string memory _hash, uint charges) public {
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
            if(patientInfo[paddr].policy.coverValue >= charges){
                transactionCount++;
                transactions[transactionCount] = Transactions(iaddr, msg.sender, charges, false);
                doctorInfo[msg.sender].transactions.push(transactionCount);
                insurerInfo[iaddr].transactions.push(transactionCount);
                patientInfo[paddr].policy.coverValue = patientInfo[paddr].policy.coverValue - charges;
                if(patientInfo[paddr].policy.coverValue==0){
                    patientInfo[paddr].policyActive = false;
                }
                claimsCount++;
                claims[claimsCount] = Claims(msg.sender, paddr, iaddr, patientInfo[paddr].policy.name, _hash, charges, false, false, transactionCount);
                insurerInfo[iaddr].claims.push(claimsCount);
            }else{
                transactionCount++;
                transactions[transactionCount] = Transactions(paddr, msg.sender, charges-patientInfo[paddr].policy.coverValue, false);
                doctorInfo[msg.sender].transactions.push(transactionCount);
                patientInfo[paddr].transactions.push(transactionCount);
                transactionCount++;
                transactions[transactionCount] = Transactions(iaddr, msg.sender, patientInfo[paddr].policy.coverValue, false);
                doctorInfo[msg.sender].transactions.push(transactionCount);
                insurerInfo[iaddr].transactions.push(transactionCount);
                claimsCount++;
                claims[claimsCount] = Claims(msg.sender, paddr, iaddr, patientInfo[paddr].policy.name, _hash, patientInfo[paddr].policy.coverValue, false, false, transactionCount);
                insurerInfo[iaddr].claims.push(claimsCount);
                patientInfo[paddr].policy.coverValue = 0;
                patientInfo[paddr].policyActive = false;
            }
        }else{
            transactionCount++;
            transactions[transactionCount] = Transactions(paddr, msg.sender, charges, false);
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
        Policy memory pol = Policy(policyList.length, msg.sender, _name, _coverValue, _timePeriod, _premium);
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
        require(doctorInfo[_addr].exists);
        payable(_addr).transfer(msg.value);
        Claims storage cl = claims[_id];
        cl.approved = true;
        Transactions storage tr = transactions[claims[_id].transactionId];
        tr.settled = true;
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
        Claims storage cl = claims[_id];
        cl.rejected = true;
        Transactions storage tr = transactions[claims[_id].transactionId];
        tr.sender = _addr;
        patientInfo[_addr].transactions.push(claims[_id].transactionId);
        Policy storage pol = patientInfo[_addr].policy;
        if(!patientInfo[_addr].policyActive){
            patientInfo[_addr].policyActive = true;
        }
        pol.coverValue += claims[_id].valueClaimed;
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
