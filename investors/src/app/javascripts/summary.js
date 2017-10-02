import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

import investorregister_artifacts from '../../build/contracts/InvestorRegister.json'
var Investor = contract(investorregister_artifacts);

window.addEventListener('load', function() {
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://"+location.hostname+"/jsonrpc"));
    Investor.setProvider(web3.currentProvider);
    Investor.deployed().then(function(instance) {
    return instance.getTotal() }).then(function(result) {
        document.getElementById("investor").innerHTML = result[1];
        document.getElementById("amount").innerHTML = result[0];
    })

    
})

window.getSummary = function () {
    Investor.deployed().then(function(instance) {
    return instance.getTotal() }).then(function(result) {
        document.getElementById("investor").innerHTML = result[2];
        document.getElementById("iamount").innerHTML = result[1];
        document.getElementById("amount").innerHTML = result[0];
    })
}
getSummary(setInterval(getSummary, 3000));

