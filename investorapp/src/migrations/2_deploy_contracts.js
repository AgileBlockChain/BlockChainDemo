var InvestorRegister = artifacts.require("./InvestorRegister.sol");
var UserMgmt = artifacts.require("./UserMgmt.sol");

module.exports = function(deployer) {
  deployer.deploy(UserMgmt);
  deployer.deploy(InvestorRegister);
};

