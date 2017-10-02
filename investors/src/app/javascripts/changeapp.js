import { default as contract } from 'truffle-contract'
import investorregister_artifacts from '../../build/contracts/InvestorRegister.json'
import usermgmt_artifacts from '../../build/contracts/UserMgmt.json'
import { Connect, SimpleSigner, MNID} from 'uport-connect'

const uport = new Connect('Investor Demo App', {
  clientId: '2ohtsJ3LmTKkV9GwaN3ayCR3qQWyJ6xBF5s',
  network: 'rinkeby',
  signer: SimpleSigner('e5c8b0b62fc140028fee85b0bf3a089dc35e552c439d5fedf748800ef5674f97')
})

const web3 = uport.getWeb3()

var User = contract(usermgmt_artifacts);
var Investor = contract(investorregister_artifacts);
var ipfsAPI = require('ipfs-api')
var ipfs = ipfsAPI('/ip4/'+location.hostname+'/tcp/5001')
Investor.setProvider(web3.currentProvider);
var userAccount;

window.addEventListener('load', function() {
    const web3 = uport.getWeb3()
    User.setProvider(web3.currentProvider)
    Investor.setProvider(web3.currentProvider);
    Investor.deployed().then(function(instance) {
    return instance.getInvestorId() }).then(function(result) {
        console.log(result);
        document.getElementById("investorId").value = result;
    })
})


window.uportConnect = function () {
   uport.requestCredentials({
      notifications: true
   }).then((credentials) => {
    console.log(credentials);
    const decodedId = MNID.decode(credentials.address);
    const specificNetworkAddress = decodedId.address;
    console.log(specificNetworkAddress);
    submitDetails(specificNetworkAddress);
})
}

window.createInvestorRecord = function(specificNetworkAddress, contractAddress, transactionContact, investmentDate, investmentAmount, docHash, notePurchaseAgreement, promisoryNote, W_9, investorQuestion, NDA, investedAmount) {
    var id = document.getElementById("investorId").value;
    console.log(id);
    Investor.deployed().then(function(instance) {
    return instance.createInvestorRecord(contractAddress, transactionContact, investmentDate, investmentAmount, docHash, notePurchaseAgreement, promisoryNote, W_9, investorQuestion, NDA, investedAmount, {from:specificNetworkAddress, gas:500000}) }).then(function(result) {
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
        document.getElementById("content").innerHTML = "<h4>Your Id is <b>"+Tid+"</b> </h4>"+"<b>Transaction Contact: </b>"+contact+"<br>"+"<b>Transaction Id: </b>"+Tid+"<br>"+"<b>Investment Date: </b>"+date+"<br>"+"<b>Amount: </b>"+amount+"<br>"+"<b>DocHash: </b><a href ='http://"+location.hostname+"/ipfsgateway/ipfs/"+result[0]+"' target='_blank'>"+result[0]+"</a><br>"+
           "<b>PurchaseAgreement: </b><a href ='http://"+location.hostname+"/ipfsgateway/ipfs/"+result[1]+"' target='_blank'>"+result[1]+"</a><br>"+
           "<b>PromisoryNote: </b><a href ='http://"+location.hostname+"/ipfsgateway/ipfs/"+result[2]+"' target='_blank'>"+result[2]+"</a><br>"+
           "<b>W_9: </b><a href ='http://"+location.hostname+"/ipfsgateway/ipfs/"+result[3]+"' target='_blank'>"+result[3]+"</a><br>"+
           "<b>Questionnare: </b><a href ='http://"+location.hostname+"/ipfsgateway/ipfs/"+result[4]+"' target='_blank'>"+result[4]+"</a><br>"+
           "<b>NDA Document: </b><a href ='http://"+location.hostname+"/ipfsgateway/ipfs/"+result[5]+"' target='_blank'>"+result[5];
        $("#submitModal").modal();
    })
}

/* Function to upload files through browser*/
window.fileUpload = function(fileId, callback) {
        var file = document.getElementById(fileId).files[0];
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
window.submitDetails = function (specificNetworkAddress) {
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
              var file4 = "file4";
              fileUpload(file4, function (response) {
                var NDA  = response;
                var hashFile = (docHash +"\n"+ notePurchaseAgreement +"\n"+ promisoryNote +"\n"+ W_9 +"\n"+ investorQuestion +"\n"+ NDA);
                console.log("All Hash:"+"\n"+docHash +"\n"+ notePurchaseAgreement +"\n"+ promisoryNote +"\n"+ W_9 +"\n"+ investorQuestion +"\n"+ NDA);
                console.log(contractAddress, transactionContact, investmentDate, investmentAmount);
                createInvestorRecord(specificNetworkAddress, contractAddress, transactionContact, investmentDate, investmentAmount, docHash, notePurchaseAgreement, promisoryNote, W_9, investorQuestion, NDA, investedAmount);
              })
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

$('#submitModal').on('hidden.bs.modal', function () {
    location.reload();
})

