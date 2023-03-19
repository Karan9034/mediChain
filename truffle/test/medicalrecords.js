const MedicalRecords = artifacts.require("MedicalRecords");

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('MedicalRecords', ([deployer, patientOne, patientTwo, doctorOne, doctorTwo, insurerOne, insurerTwo]) => {
    let medicalRecords

    before(async () => {
        medicalRecords = await MedicalRecords.deployed()
    })

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = await medicalRecords.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })
    
        it('has a name', async () => {
            const name = await medicalRecords.name()
            assert.equal(name, 'medicalRecords')
        })
    })

    describe('patients', async () => {
        let result
        const name = "Sam"
        const age = 22
        const hash = "QmV8cfu6n4NT5xRr2AHdKxFMTZEJrA44qgrBCr739BN9Wb"


        before(async () => {
            result = await medicalRecords.add_agent(name, age, 0, hash)
            
        })

        it('adds patients', async () => {
            
        })
    })

});