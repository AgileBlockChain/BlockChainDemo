import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'
import { Connect } from 'uport-connect'
import investorregister_artifacts from '../../build/contracts/InvestorRegister.json'
import usermgmt_artifacts from '../../build/contracts/UserMgmt.json'

const uport = new Connect('InvestorApp', {network: 'rinkeby'})
var User = contract(usermgmt_artifacts);
var Investor = contract(investorregister_artifacts);
console.log(Investor)
var ipfsAPI = require('ipfs-api')
var ipfs = ipfsAPI('/ip4/'+location.hostname+'/tcp/5001')
var account;
var userAccount;

window.addEventListener('load', function() {
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://"+location.hostname+":8545"));
    Investor.setProvider(web3.currentProvider);
    User.setProvider(web3.currentProvider)
    //account = web3.eth.accounts[3];
    account = "0x2a846c1f64c4b9cc1726d8132d2723fa906a0706";
    console.log(account);
    Investor.deployed().then(function(instance) {
    return instance.getInvestorId() }).then(function(result) {
        console.log(result);
        document.getElementById("investorId").value = result;
    })
})

window.uportConnect = function () {
    let Web3 = uport.getWeb3()
    Web3.eth.getCoinbase((error, address) => {
        console.log("old"+address);
        //account= address;
        submitDetails();
    if (error) { throw error }
  })
}

window.createInvestorRecord = function(contractAddress, transactionContact, investmentDate, investmentAmount, docHash, notePurchaseAgreement, promisoryNote, W_9, investorQuestion, investedAmount) {
    var id = document.getElementById("investorId").value;
    console.log(id);
    Investor.deployed().then(function(instance) {
    return instance.createInvestorRecord(contractAddress, transactionContact, investmentDate, investmentAmount, docHash, notePurchaseAgreement, promisoryNote, W_9, investorQuestion, investedAmount, {from:account, gas:500000}) }).then(function(result) {
        //console.log(err);
        console.log(result);
        getRecord(id);
    })
}

window.getRecord = function(id) {
    Investor.deployed().then(function(instance) {
    return instance.getInvestorRecord(id) }).then(function(result) {
        console.log(result);
        console.log("Tcontact: "+result[0]+"\n"+"Id: "+result[1]+"\n"+"Date: "+result[2]+"\n"+"Amount: "+result[3]);
        getInvestorDoc(id, result[0], result[1], result[2], result[3] );
    })
}

window.getInvestorDoc = function(id, contact, Tid, date, amount) {
    
    Investor.deployed().then(function(instance) {
    return instance.getInvestorDoc(id) }).then(function(result) { 
        console.log (result);
        console.log("DocHash: "+result[0]+"\n"+"PurchaseAgreement: "+result[1]+"\n"+"PromisoryNote: "+result[2]+"\n"+"W_9: "+result[3]+"\n"+"Questionnare: "+result[4]);
        document.getElementById("content").innerHTML = "<h4>Your Id is <b>"+Tid+"</b> keep for future reference</h4>"+"<b>Transaction Contact: </b>"+contact+"<br>"+"<b>Transaction Id: </b>"+Tid+"<br>"+"<b>Investment Date: </b>"+date+"<br>"+"<b>Amount: </b>"+amount+"<br>"+"<b>DocHash: </b>"+result[0]+"<br>"+"<b>PurchaseAgreement: </b>"+result[1]+"<br>"+"<b>PromisoryNote: </b>"+result[2]+"<br>"+"<b>W_9: </b>"+result[3]+"<br>"+"<b>Questionnare: </b>"+result[4];
        $("#myModal").modal();
    })
}

/* Function to upload files through browser*/
window.fileUpload = function(fileId, callback) {
        var file = document.getElementById(fileId).files[0];
        console.log("hello"+file);
        if ( file == undefined ) {
            callback("NA");
        }
        else {
            var reader = new FileReader();
            reader.onload = function (e) {
                const buffer = Buffer.from(e.target.result);
                var request = new XMLHttpRequest();
                request.open('POST', "http://"+location.hostname+"/ipfsgateway/ipfs/", true);
                request.setRequestHeader("Content-type", "text/plain");
                request.send(buffer);
                request.onreadystatechange=function() {
                    if (request.readyState==this.HEADERS_RECEIVED) {
                        var fileHash = request.getResponseHeader("Ipfs-Hash");
                        callback(fileHash)
                    }
                }
            }
            reader.readAsArrayBuffer(file);
         }
}

/* Function to upload all text entry from UI except files*/
window.fileCreate = function (data, callback) {
    var content = new Buffer (data);
    var request = new XMLHttpRequest();
    request.open('POST', "http://"+location.hostname+"/ipfsgateway/ipfs/", true);
    request.setRequestHeader("Content-type", "text/plain");
    request.send(content);
    request.onreadystatechange=function() {
        if (request.readyState==this.HEADERS_RECEIVED) {
            var hash = request.getResponseHeader("Ipfs-Hash");
            console.log("Doc Hash:"+hash);
            callback(hash);
        }
    }
}

/*Call back functions to seqence all uploading items to ipfs*/
window.submitDetails = function (addr) {
  User.deployed().then(function(instance) {
    console.log(instance.address);
    var contractAddress = instance.address;
    var transactionContact = document.getElementById("transactionContact").value;
    var investmentAmount = document.getElementById("investedAmount").value;
    var investedAmount = document.getElementById("investmentAmount").value;
    var investmentDate = document.getElementById("dtp_input2").value;
    console.log(investmentDate);
    console.log("investmentDate" +investmentDate);
    var investmentDetails = ("Transaction Contact: "+transactionContact+"\n"+"Investor ID: "+document.getElementById("investorId").value+"\n" + "Investment Date: "+investmentDate+"\n" + "Investment Amount: "+investmentAmount+"\n" +"Discount: " +document.getElementById("discount").value+"\n"+"\n");
    console.log(investmentDetails);
    var investorInfo = ("First Name: "+document.getElementById("firstname").value+"\n" + "Last Name: "+document.getElementById("lastname").value+"\n" +"Phone: "+document.getElementById("phone").value+"\n" + "Email: "+document.getElementById("email").value+"\n" + "Address: "+document.getElementById("address").value+"\n"+"\n");
    var investorDetails = ("Investment Details" +"\n"+investmentDetails+"\n"+"----------------------------"+"\n"+"Investor Info"+"\n"+investorInfo);

    fileCreate(investorDetails, function(response) {
      var docHash = response;
      var file0 = "file0";
      fileUpload(file0, function (response) {
        var notePurchaseAgreement = response;
        var file1 = "file1";
        fileUpload(file1, function (response) {
          var promisoryNote = response;
          var file2 = "file2";
          fileUpload(file2, function (response) {
            var W_9 = response;
            var file3 = "file3";
            fileUpload(file3, function (response) {
              var investorQuestion = response;
              var hashFile = (docHash +"\n"+ notePurchaseAgreement +"\n"+ promisoryNote +"\n"+ W_9 +"\n"+ investorQuestion);
              console.log("All Hash:"+"\n"+docHash +"\n"+ notePurchaseAgreement +"\n"+ promisoryNote +"\n"+ W_9 +"\n"+ investorQuestion);
              console.log(contractAddress, transactionContact, investmentDate, investmentAmount);
              createInvestorRecord(contractAddress, transactionContact, investmentDate, investmentAmount, docHash, notePurchaseAgreement, promisoryNote, W_9, investorQuestion, investedAmount);
            })
          })
        })
      })
    })
  })
}

/*Function to fetch the main Ipfs file and to extract all the other ipfs hashes*/
window.displayIpfsFile = function(hash) {
    console.log("retrieve hash:"+hash);

    ipfs.cat(hash, function (err, stream) {
      var res = '';

      stream.on('data', function (chunk) {
        res += chunk.toString()
      })

      stream.on('error', function (err) {
        console.error('Oh nooo', err)
      })

      stream.on('end', function () {
        //console.log('Got:', res);
        document.getElementById('content').innerText=res;
      })
    })
}

$('#myModal').on('hidden', function () {
  document.location.reload();
})
