const MedicalRecords = artifacts.require("MedicalRecords");

module.exports = function (deployer) {
  deployer.deploy(MedicalRecords);
};
