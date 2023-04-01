// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract MediChain {
    // State Variables
    uint creditPool;
    string public name;
    address[] public patientList;
    address[] public doctorList;
    address[] public insurerList;
    mapping (address => Patient) patientInfo;
    mapping (address => Doctor) doctorInfo;
    mapping (address => Insurer) insurerInfo;
    mapping (address => address) Patient_Insurer;
    mapping (address => string) patientRecords;


    struct Patient {
        string name;
        uint age;
        address[] doctorAccessList;
        uint[] diagnosis;
        string record;
    }
    struct Doctor {
        string name;
        uint age;
        address[] patientAccessList;
    }
    struct Insurer {
        string name;
        uint count_of_patient;
        address[] PatientWhoClaimed;
        address[] DocName;
        uint[] diagnosis;
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
    }

    function add_agent(string memory _name, uint _age, uint _designation, string memory _hash) public {
        require(msg.sender != address(0));
        require(_designation >= 0 && _designation <3);
        require(bytes(_name).length > 0);
        address addr = msg.sender;
        if(_designation == 0){
            require(_age > 0);
            require(bytes(_hash).length > 0);
            patientInfo[addr].name = _name;
            patientInfo[addr].age = _age;
            patientInfo[addr].record = _hash;
            patientList.push(addr);
            // emit PatientAdded(patientInfo[addr].name, patientInfo[addr].age, patientInfo[addr].doctorAccessList, patientInfo[addr].diagnosis, patientInfo[addr].record);
        }
        else if (_designation == 1){
            require(_age > 0);
            doctorInfo[addr].name = _name;
            doctorInfo[addr].age = _age;
            doctorList.push(addr);
            // emit DoctorAdded(doctorInfo[addr].name, doctorInfo[addr].age, doctorInfo[addr].patientAccessList);
        }
        else if(_designation == 2){
            insurerInfo[addr].name = _name;
            insurerList.push(addr);
            // emit InsurerAdded(insurerInfo[addr].name, insurerInfo[addr].count_of_patient, insurerInfo[addr].PatientWhoClaimed, insurerInfo[addr].DocName, insurerInfo[addr].diagnosis);
        }
        else{
            revert();
        }
    }

    function get_patient(address addr) view public returns (string memory, uint, uint[] memory, address, string memory){
        require(addr != address(0));
        require(msg.sender != address(0));
        return (patientInfo[addr].name, patientInfo[addr].age, patientInfo[addr].diagnosis, Patient_Insurer[addr], patientInfo[addr].record);
    }

    function get_doctor(address addr) view public returns (string memory, uint){
        require(addr != address(0));
        require(msg.sender != address(0));
        return (doctorInfo[addr].name, doctorInfo[addr].age);
    }
    function get_patient_doctor_name(address paddr, address daddr) view public returns (string memory, string memory){
        require(paddr != address(0));
        require(daddr != address(0));
        require(msg.sender != address(0));
        return (patientInfo[paddr].name, doctorInfo[daddr].name);
    }
    function get_insurer(address addr) view public returns (string memory, uint, address[] memory, address[] memory, uint[] memory){
        require(addr != address(0));
        require(msg.sender != address(0));
        return (insurerInfo[addr].name, insurerInfo[addr].count_of_patient, insurerInfo[addr].PatientWhoClaimed, 
        insurerInfo[addr].DocName, insurerInfo[addr].diagnosis);
    }

    // Called by patient
    // Review: creditPool and self transfer?
    function permit_access(address addr) public {
        // require(msg.value == 2 ether);
        require(addr != address(0));
        require(msg.sender != address(0));
        require(bytes(patientInfo[msg.sender].name).length > 0);
        require(bytes(doctorInfo[addr].name).length > 0);
        // creditPool += 2;
        doctorInfo[addr].patientAccessList.push(msg.sender);
        patientInfo[msg.sender].doctorAccessList.push(addr);
    }

    function select_insurer(address payable iaddr, uint[] memory _diagnosis) payable public {
        require(iaddr != address(0));
        require(msg.sender != address(0));
        uint total_amount = (_diagnosis.length);
        require(msg.value == total_amount*(1 ether));
        require(msg.sender.balance >= msg.value);
        iaddr.transfer(msg.value);
        Patient_Insurer[msg.sender] = iaddr;
        patientInfo[msg.sender].diagnosis = _diagnosis;
        insurerInfo[iaddr].count_of_patient++;
    }


    // Called by doctor
    // Review: creditPool and self transfer
    function insurance_claim(address payable paddr, uint _diagnosis, string memory _hash) public {
        require(paddr != address(0));
        require(msg.sender != address(0));
        bool patientFound = false;
        for(uint i = 0;i<doctorInfo[msg.sender].patientAccessList.length;i++){
            if(doctorInfo[msg.sender].patientAccessList[i]==paddr){
                // (msg.sender).transfer(2 ether);
                // creditPool -= 2;
                patientFound = true;
            }
        }
        if(patientFound==true){
            set_hash(paddr, _hash);
            remove_patient(paddr, msg.sender);
        }else {
            revert();
        }

        bool DiagnosisFound = false;
        for(uint j = 0; j < patientInfo[paddr].diagnosis.length;j++){
            if(patientInfo[paddr].diagnosis[j] == _diagnosis)DiagnosisFound = true;
        }
        if(DiagnosisFound){
            insurerInfo[Patient_Insurer[paddr]].PatientWhoClaimed.push(paddr);
            insurerInfo[Patient_Insurer[paddr]].DocName.push(msg.sender);
            insurerInfo[Patient_Insurer[paddr]].diagnosis.push(_diagnosis);
        }
    }

    // Called by insurer
    function accept_claim(address payable paddr) public payable {
        require(paddr != address(0));
        require(msg.sender != address(0));
        require(msg.sender.balance >= msg.value);
        require(msg.value == 4 ether);
        paddr.transfer(msg.value);
        uint index = remove_element_in_array(insurerInfo[msg.sender].PatientWhoClaimed,paddr);
        if(insurerInfo[msg.sender].diagnosis.length > 1){
            insurerInfo[msg.sender].DocName[index] = insurerInfo[msg.sender].DocName[insurerInfo[msg.sender].DocName.length - 1];
        }
        insurerInfo[msg.sender].DocName.pop();

        if(insurerInfo[msg.sender].diagnosis.length > 1){
            insurerInfo[msg.sender].diagnosis[index] = insurerInfo[msg.sender].diagnosis[insurerInfo[msg.sender].diagnosis.length - 1];
        }
        insurerInfo[msg.sender].diagnosis.pop();
    }
    
    function remove_element_in_array(address[] storage Array, address addr) internal returns (uint)
    {
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

    function remove_patient(address paddr, address daddr) public {
        require(paddr != address(0));
        require(daddr != address(0));
        remove_element_in_array(doctorInfo[daddr].patientAccessList, paddr);
        remove_element_in_array(patientInfo[paddr].doctorAccessList, daddr);
    }
    
    function get_accessed_doctorlist_for_patient(address addr) public view returns (address[] memory){ 
        require(addr != address(0));
        address[] storage doctoraddr = patientInfo[addr].doctorAccessList;
        return doctoraddr;
    }
    function get_accessed_patientlist_for_doctor(address addr) public view returns (address[] memory){
        require(addr != address(0));
        return doctorInfo[addr].patientAccessList;
    }

    // Review: creditPool and self transfer
    function revoke_access(address daddr) public payable{
        require(daddr != address(0));
        require(msg.sender != address(0));
        remove_patient(msg.sender,daddr);
        // payable(msg.sender).transfer(2 ether);
        // creditPool -= 2;
    }

    function get_patient_list() public view returns(address[] memory){
        return patientList;
    }

    function get_doctor_list() public view returns(address[] memory){
        return doctorList;
    }
    function get_insurer_list() public view returns(address[] memory){
        return insurerList;
    }

    function get_hash(address paddr) public view returns(string memory){
        require(paddr != address(0));
        return patientInfo[paddr].record;
    }

    function set_hash(address paddr, string memory _hash) internal {
        require(paddr != address(0));
        require(bytes(_hash).length > 0);
        patientInfo[paddr].record = _hash;
    }
}
