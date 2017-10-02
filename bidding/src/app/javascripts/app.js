// Import the page's CSS. Webpack will know what to do with it.
//import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import bidding_artifacts from '../../build/contracts/Bidding.json'
var ipfsAPI = require('ipfs-api')
var ipfs = ipfsAPI('ip4/'+location.hostname+'/tcp/5001', {protocol: 'http'})

var Bidding = contract(bidding_artifacts);
var buyerAddrs;
var sellerAddrs;

window.addEventListener('load', function() {
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://"+location.hostname+"/jsonrpc"));
    Bidding.setProvider(web3.currentProvider);
    buyerAddrs = web3.eth.accounts[0];
    sellerAddrs = web3.eth.accounts[2];
    var buyerBalance = web3.eth.getBalance(buyerAddrs);
    var sellerBalance = web3.eth.getBalance(sellerAddrs);
    document.getElementById("buyer_balance").innerHTML = "Buyer:" + (buyerBalance / 1000000000000);
    document.getElementById("seller_balance").innerHTML = "Seller:" +  (sellerBalance / 1000000000000);
    getProjectList();
    getBidList();
})

window.getProjectList = function() {
    Bidding.deployed().then(function(instance) {
    return instance.getProjectLength()}).then(function(length) {
        var len = length;
        if(len > 0) {
            var i;
            for(i = 1; i <= len; i++) {
                var a = Promise.resolve(getPro(i));
            } 
        } 
    })
}

window.getBidList = function() {
    Bidding.deployed().then(function(instance) {
    return instance.getBidLength()}).then (function(length) {
        if (length > 0) {
            var i;
            for(i = 1; i <= length; i++) {
              var a = Promise.resolve(getBid(i));
            }
        }
    })
}


window.balance=function() {
    Bidding.deployed().then(function(instance) {
        var contractAddr = instance.address;
        var contractBal = web3.eth.getBalance(contractAddr);
        document.getElementById("contractBalance").innerHTML = contractBal;
    })
}

window.projectCreation = function(dHash, fHash) {
    var projectName = document.getElementById ("pname").value;
    var description = document.getElementById ("pdetail").value;
    var buyerAddrs = web3.eth.accounts[0];
    var pvalue = (document.getElementById("pvalue").value)*(1000000000000);
    Bidding.deployed().then(function(instance) {
        return instance.createProject(projectName, description, pvalue, dHash, fHash, {from:buyerAddrs, gas:900000}) }).then(function(){
        getProjectId();
    })
}

window.uploads = function () {
    var toStore = document.getElementById('details').value;
    var file = document.getElementById('inputFile').files[0];
    if (toStore.length != 0 && file !== undefined ) {
        var content = new Buffer (toStore);
        var request = new XMLHttpRequest();
        var detailsHash;
        var fileHash;
        request.open('POST', "http://"+location.hostname+"/ipfsgateway/ipfs/", true);
        request.setRequestHeader("Content-type", "text/plain");
        request.send(toStore);
        request.onreadystatechange=function() {
            if (request.readyState==this.HEADERS_RECEIVED) {
              detailsHash = request.getResponseHeader("Ipfs-Hash");
              console.log("DetailsHash:"+detailsHash);

            }
        }

        var reader = new FileReader();
        reader.onload = function (e) {
        var fileString = e.target.result;
          console.log(fileString);
          const buffer = Buffer.from(fileString);
          var request = new XMLHttpRequest();
          request.open('POST', "http://"+location.hostname+"/ipfsgateway/ipfs/", true);
          request.setRequestHeader("Content-type", "text/plain");
          request.send(buffer);
          request.onreadystatechange=function() {
            if (request.readyState==this.HEADERS_RECEIVED) {
              fileHash = request.getResponseHeader("Ipfs-Hash");
              console.log("fileHash:"+fileHash);
              setTimeout(function() {
                projectCreation(detailsHash, fileHash);
              },3000);
            }
          }
        }
        reader.readAsArrayBuffer(file);
    }
    else {
        detailsHash = "NA";
        fileHash = "NA";
        projectCreation(detailsHash, fileHash);
    }
}

window.displayIpfsFile = function(hash) {
    ipfs.cat(hash, function (err, stream) {
      var res = '';

      stream.on('data', function (chunk) {
        res += chunk.toString()
      })

      stream.on('error', function (err) {
        console.error('Oh nooo', err)    
      })

      stream.on('end', function () {
        console.log('Got:', res);
        document.getElementById('ipfsHashAddress').innerHTML="Ipfs Hash: "+hash;
        document.getElementById('content').innerText=res;
      })
    })
}

window.getProjectId =function() {
    Bidding.deployed().then(function(instance) {
    return instance.getprojectID() }).then(function(result) {
        var pid = result;
        getPro(pid);
    })
}

window.getPro = function(pid) {
    Bidding.deployed().then(function(instance) {
        return instance.getProject(pid)}).then(function(result) {
            var pvalue = result[2] / 1000000000000;
            var project_state = "";
            if (result[3] == 1) {
              project_state = "Open";
            }
            if (result[3] == 2) {
              project_state = "In Process";
            }
            if (result[3] == 3) {
              project_state = "Closed";
            }
            var hashColumn = '';
            if (result[5] == "NA") {
              hashColumn = '<td>'+result[5]+'</td>';
            } else {
              hashColumn = '<td> <button style= " type="button" name="button" data-toggle="modal" data-target="#myModal" class="btn btn-info"  id = "'+result[5]+'" onclick="displayIpfsFile(this.id)">Info</button></td>';
            }
            var column = '';
            if (result[6] == "NA") {
              column = '<td>'+result[6]+'</td>';
            } else {
              column = '<td> <button style= " type="button" name="button" data-toggle="modal" data-target="#myModal" class="btn btn-info"  id = "'+result[6]+'" onclick="displayIpfsFile(this.id)">View</button></td>';
            }
            var table = document.getElementById("projectListTable");
            var y = $('#projectListTable tr').length;
            var row = table.insertRow(y);
            row.innerHTML = '<tr><td> <input  onclick="load_bid(\''+result[0]+'\','+result[4]+' )" type="radio" name="prj_select" value="'+result[4]+'"> </td>'+
                '<td >'+ result[0] +'</td><td >'+ result[1] +'</td><td >'+ pvalue +'</td>'+
                '<td id="prj_state'+result[4]+'">'+project_state+hashColumn+column;
        });
}

window.load_bid= function(p_name, proId){
   $('#bName').val(p_name);
   $('#proId').val(proId);
}

window.totalval = function(id) {
   var amt = $('#'+id).val();
   $('#id_total_value').val(amt*2);
}

window.createBid = function() {
    var amount = ((document.getElementById("bAmount").value)*2) * 1000000000000;
    var name = document.getElementById("bName").value;
    var prjId = document.getElementById("proId").value;
    var sellerBalance = web3.eth.getBalance(sellerAddrs);
    if (sellerBalance >= amount) {
      Bidding.deployed().then(function(instance) {
         return instance.createBid(name,prjId, {from:sellerAddrs, value:amount, gas:900000}) }).then(function(){
         getBidId();
         getBalance();
      })
    } else {
      alert("Insufficient Balance");
    }
}

window.getBidId = function() {
  Bidding.deployed().then(function(instance) {
  return instance.getbidID() }).then(function(result) {
    var bid = result;
    getBid(bid);
  })
}

window.getBid = function(bid) {
   var sellerAddrs = web3.eth.accounts[3];
   Bidding.deployed().then(function(instance) {
       return instance.getBid(bid)}).then(function(resultbid) {
           var bidamount = resultbid[1] / 1000000000000;
           var bid_state ='';
           var disp_var = '';
           var acceptdisp_var = '';
           var rejectdisp_var = '';
           if(resultbid[2] == 1) {
              var bid_state = "Open";
              acceptdisp_var = "inline-block";
              rejectdisp_var = "inline-block";
              disp_var = "none";
           }
           if(resultbid[2] == 2) {
              var bid_state = "Accepted";
              disp_var = "inline-block";
              acceptdisp_var = "none";
              rejectdisp_var = "none";
           }
           if(resultbid[2] == 3) {
              var bid_state = "Rejected";
              acceptdisp_var = "none";
              rejectdisp_var = "none";
              disp_var = "none";
           }
           if(resultbid[2] == 4) {
              var bid_state = "Closed";
              disp_var = 'none';
              acceptdisp_var = "none";
              rejectdisp_var = "none";
           }

           var table2 = document.getElementById("bid_list_tabel");
           var y2 = $('#bid_list_tabel tr').length;
           var row2 = table2.insertRow(y2);
           row2.innerHTML = '<tr> '+
               '<td >'+ resultbid[0] +'</td><td >'+ bidamount +'</td><td id = "bid_list_state'+resultbid[3]+'" >'+ bid_state +'</td>'+
               '<td id = "action_td'+resultbid[3]+'"><button style= "display :'+acceptdisp_var+';"type="button" name="button" class="btn btn-success" id = "action_accept_btn'+resultbid[3]+'" onclick="acceptBid('+resultbid[3]+','+resultbid[1]+', '+resultbid[4]+')">Accept</button>'+
               '<button style= "display :'+rejectdisp_var+';"type="button" name="button" class="btn btn-danger"  id = "action_reject_btn'+resultbid[3]+'" onclick="rejectBid(\''+resultbid[3]+'\','+resultbid[4]+')">Reject</button>'+
               '<button style= "display :'+disp_var+';" type="button" name="button" class="btn btn-danger"  id = "action_conform_btn'+resultbid[3]+'" onclick="itemReceived(\''+resultbid[3]+'\','+resultbid[4]+')">Confirm</button>' +
            '</td>';
            getBalance();
       })
}

window.acceptBid = function(bid_id, bid_amount, prj_id) {
    var buyerAddrs = web3.eth.accounts[0];
    var proBidAmount = bid_amount*2;
    var buyerAddrs = web3.eth.accounts[0];
    var buyerBalance = web3.eth.getBalance(buyerAddrs);
    if ( buyerBalance >= proBidAmount) {
      Bidding.deployed().then(function(instance) {
          return instance.acceptBid(bid_id,prj_id, {from:buyerAddrs, value:proBidAmount});
          getBalance();}).then(function() {
          var result = getBidState(bid_id, prj_id);
      })
    } else {
      alert("Insufficient balance");
    }
}

// After AcceptBid function this function returns the bidState
window.getBidState = function(bid_id, prj_id) {
  Bidding.deployed().then(function(instance) {
  return instance.getacceptBid()}).then(function(result) {
    var bidState = result[0];
    var prj_state = result[2];
    var result_prj_id = result[1];

    if(bidState == 2) {
       $('#bid_list_state'+bid_id).html( "Accepted");
       $('#action_accept_btn'+bid_id).hide();
       $('#action_reject_btn'+bid_id).hide();
       $('#action_conform_btn'+bid_id).css({"display": "inline-block"});
       if (prj_state == 2) {
         $('#prj_state'+prj_id).html( "In Process");

       }
    }
    getBalance();

  })
}

window.rejectBid = function(bid_id,prj_id) {
    var buyerAddrs = web3.eth.accounts[0];
    Bidding.deployed().then(function(instance) {
        return instance.rejectBid(bid_id,{from:buyerAddrs});
        getBalance();}).then(function() {
        var result = getRejectState(bid_id,prj_id);
    })
}

//After RejectBid function this function returns the bidState
window.getRejectState = function(bid_id, prj_id) {
  Bidding.deployed().then(function(instance) {
  return instance.getrejectBid()}).then(function(result) {
    if(result == 3) {
       $('#action_accept_btn'+bid_id).hide();
       $('#action_reject_btn'+bid_id).hide();
       $('#action_conform_btn'+bid_id).css({"display":"none"});
       $('#bid_list_state'+bid_id).html( "Rejected");
       getBalance();
    }

  })
}

window.itemReceived = function(bid_id,prj_id) {
    var buyerAddrs = web3.eth.accounts[0];
     Bidding.deployed().then(function(instance) { instance.itemReceived(bid_id,prj_id, {from:buyerAddrs}) }).then(function(result) {
        var res = itemReceiveState(bid_id, prj_id);

     })
}

window.itemReceiveState = function(bid_id, prj_id) {
  Bidding.deployed().then(function(instance) {
  return instance.geitemReceived()}).then(function(result) {
    getBalance();
    $('#prj_state'+prj_id).html( "Closed");
    $('#bid_list_state'+bid_id).html( "Closed");
    $('#action_conform_btn'+bid_id).css({"display":"none"});
    getBalance();

  })
}

window.getBalance = function() {
    var buyerAddrs = web3.eth.accounts[0];
    var sellerAddrs = web3.eth.accounts[2];
    var buyerBalance = web3.eth.getBalance(buyerAddrs);
    var sellerBalance = web3.eth.getBalance(sellerAddrs);
    document.getElementById("buyer_balance").innerHTML = "Buyer:" + " " + (buyerBalance / 1000000000000);
    document.getElementById("seller_balance").innerHTML = "Seller:" + " " + (sellerBalance / 1000000000000);
}

