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
        console.log(result.toString());
        console.log(result-5);
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
  }).catch((err) => {
        alert (err.toString());
  })

}

window.createInvestorRecord = function(specificNetworkAddress, contractAddress,transactionContact, investmentDate, investmentAmount,allHash, investedAmount) {
    Investor.deployed().then(function(instance) {
      console.log(instance);
      return instance.createInvestorRecord(contractAddress,transactionContact, investmentDate, investmentAmount,allHash, investedAmount, {from:specificNetworkAddress, gas:700000}) }).then(function(result) {
        console.log(result);
        getRecordId();
      }).catch((err) => {
         console.log(err)
        alert (err.toString());
      })
}

window.getRecordId = function () {
    Investor.deployed().then(function(instance) {
    return instance.getInvestorId() }).then(function(result) {
        console.log(result);
        var id = result - 5;
        getInvestorRecord(id);
    })
}

window.getInvestorRecord = function(id) {
    Investor.deployed().then(function(instance) {
    return instance.getInvestorRecord(id) }).then(function(result) {
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
    console.log(data);
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
    var investmentDetails = ("Transaction Contact: "+transactionContact+"\n"+"Investment Date: "+investmentDate+"\n" + "Investment Amount: "+investmentAmount+"\n" +"Discount: " +document.getElementById("discount").value+"\n"+"\n");
    console.log(investmentDetails);
    var investorInfo = ("First Name: "+document.getElementById("firstname").value+"\n" + "Last Name: "+document.getElementById("lastname").value+"\n" +"Phone: "+document.getElementById("phone").value+"\n" + "Email: "+document.getElementById("email").value+"\n" + "Address: "+document.getElementById("address").value+"\n"+"\n");
    var investorDetails = ("Investment Details" +"\n"+investmentDetails+"\n"+"----------------------------"+"\n"+"Investor Info"+"\n"+investorInfo);
    var json;
    fileCreate(investorDetails, function(response) {
      if (response != "NA") {
        var docHash = response;
        json = '{"InfoDoc":"'+docHash+'"'
      }
      var file0 = "file0";
      fileUpload(file0, function (response) {
        if (response != "NA") {
          var notePurchaseAgreement = response;;
          json = json+',"PurchaseAgreement":"'+notePurchaseAgreement+'"'
        }
        var file1 = "file1";
        fileUpload(file1, function (response) {
          if (response != "NA") {
            var promisoryNote = response;
            json = json+',"PromisoryNote":"'+promisoryNote+'"'
          }
          var file2 = "file2";
          fileUpload(file2, function (response) {
            if (response != "NA") {
              var W_9 = response;
              json = json+',"W9":"'+W_9+'"'
            }
            var file3 = "file3";
            fileUpload(file3, function (response) {
              if (response != "NA") {
                var investorQuestion = response;
                json = json+',"InvestorQuestion":"'+investorQuestion+'"'
              }
              
              var file4 = "file4";
              fileUpload(file4, function (response) {
                if (response != "NA") {
                  var NDA  = response;
                  json = json+',"NDA":"'+NDA+'"}'
                }
                else {
                  json  = json + '}';
                }
                var hashFile = (docHash +"\n"+ notePurchaseAgreement +"\n"+ promisoryNote +"\n"+ W_9 +"\n"+ investorQuestion +"\n"+ NDA);
                console.log("All Hash:"+"\n"+docHash +"\n"+ notePurchaseAgreement +"\n"+ promisoryNote +"\n"+ W_9 +"\n"+ investorQuestion +"\n"+ NDA);
                console.log(json);
                $("#acceptModal").modal();
                setTimeout(function() {$('#acceptModal').modal('hide'); }, 6000);
                fileCreate(json, function(response) {
                  var allHash = response;
                  console.log(allHash);
                  createInvestorRecord(specificNetworkAddress, contractAddress,transactionContact, investmentDate, investmentAmount,allHash, investedAmount);
               })
              })
            })
          })
        })
      })
    })
  })
}

/*Function to fetch the main Ipfs file and to extract all the other ipfs hashes*/
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

$('#submitModal').on('hidden.bs.modal', function () {
    location.reload();
})
