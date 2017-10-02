var Bidding = artifacts.require("./Bidding.sol");

module.exports = function(deployer) {
  deployer.deploy(Bidding);
};
