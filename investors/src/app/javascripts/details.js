import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'
import investorregister_artifacts from '../../build/contracts/InvestorRegister.json'

var ipfsAPI = require('ipfs-api')
var ipfs = ipfsAPI('/ip4/'+location.hostname+'/tcp/5001')
var Investor = contract(investorregister_artifacts);

window.addEventListener('load', function() {
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://"+location.hostname+"/jsonrpc"));
    Investor.setProvider(web3.currentProvider);
})


window.getInvestorRecord = function() {
    var id = document.getElementById("investorId").value;
    Investor.deployed().then(function(instance) {
    return instance.getInvestorRecord(id) }).then(function(result) {
      if (result[0] == 0) {
            alert("Invalid Id");
      } else {
        console.log (result);
        var bhash = result[4];
        displayIpfsFile(bhash, function (response) {
            var has = response;
            var hashes = JSON.parse(has);
            var infoHash = hashes.InfoDoc;
            var pAgreement = hashes.PurchaseAgreement;
            if (pAgreement == undefined) { pAgreement = "NA"; }
            var note = hashes.PromisoryNote;
            if (note == undefined) { note = "NA"; }
            var w9 = hashes.W9;
            if (w9 == undefined) { w9 = "NA"; }
            var question = hashes.InvestorQuestion;
            if (question == undefined) { question = "NA"; }
            var nd = hashes.NDA;
            if (nd == undefined) { nd = "NA"; }
            document.getElementById("content").innerHTML = "<h4>Your Id is <b>"+result[1]+"</b> </h4>"+"<b>Transaction Contact: </b>"+result[0]+"<br>"+"<b>Transaction Id: </b>"+result[1]+"<br>"+"<b>Investment Date: </b>"+result[2]+"<br>"+"<b>Amount: </b>"+result[3]+"<br>"+"<b>DocHash: </b><a href ='http://"+location.hostname+"/ipfsgateway/ipfs/"+infoHash+"' target='_blank'>"+infoHash+"</a><br>"+
           "<b>PurchaseAgreement: </b><a href ='http://"+location.hostname+"/ipfsgateway/ipfs/"+pAgreement+"' target='_blank'>"+pAgreement+"</a><br>"+
           "<b>PromisoryNote: </b><a href ='http://"+location.hostname+"/ipfsgateway/ipfs/"+note+"' target='_blank'>"+note+"</a><br>"+
           "<b>W_9: </b><a href ='http://"+location.hostname+"/ipfsgateway/ipfs/"+w9+"' target='_blank'>"+w9+"</a><br>"+
           "<b>Questionnare: </b><a href ='http://"+location.hostname+"/ipfsgateway/ipfs/"+question+"' target='_blank'>"+question+"</a><br>"+
           "<b>NDA Document: </b><a href ='http://"+location.hostname+"/ipfsgateway/ipfs/"+nd+"' target='_blank'>"+nd;
            $("#submitModal").modal();
        })
      }
    })
}

window.displayIpfsFile = function(hash, callback) {
    if(hash == undefined)
      {
        callback("NA")
      }

   else {
    console.log("retrieve hash:"+hash);

    ipfs.cat(hash, function (err, stream) {
      console.log("stream"+stream);
      var res = '';

      stream.on('data', function (chunk) {
        res += chunk.toString()
      })

      stream.on('error', function (err) {
        console.error('Oh nooo', err)
      })

      stream.on('end', function () {
        console.log('Got:', res);
        callback(res)

      })
    })
    }
}

