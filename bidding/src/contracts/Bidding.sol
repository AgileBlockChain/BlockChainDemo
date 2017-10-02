pragma solidity ^0.4.11;

contract Bidding {

    enum ProjectState { NULL, OPEN, INPROCESS, CLOSED }
    ProjectState public projectState;
    enum BidState { NULL, OPEN, ACCEPTED, REJECTED, CLOSED }
    BidState public state;
    address buyerAddress;
    address sellerAddress;

    struct Project {
        string  projectName;
        string desc;
        uint price;
        uint projectState;
        address projectAddress;
        string detailsHash;
        string fileHash;
    }

    struct Bid {
        address bidAddress;
        string name;
        uint amount;
        uint projectId;
        uint bidstate;
        string bidHash;
        string bidFileHash;
    
    }
    
    function getProjectLength() constant returns (uint){
        return projectIndex.length;
    }
    
    function getBidLength() constant returns (uint) {
        return bidIndex.length;
    }

    mapping (uint  => Bid) bid;
    uint [] bidIndex;
    uint bidID;
    mapping (uint => Project) projects;
    uint [] projectIndex;
    uint projectID;

    function createProject(string proname, string desc, uint price, string hash, string fileHash) {
        buyerAddress = msg.sender;
        projectID = projectIndex.length+1;
        projects[projectID].projectAddress = msg.sender;
        projects[projectID].projectName = proname;
        projects[projectID].desc = desc;
        projects[projectID].price = price ;
        projects[projectID].detailsHash = hash ;
        projects[projectID].fileHash = fileHash;
        projects[projectID].projectState = uint256(ProjectState.OPEN);
        projectIndex.push(projectID);
    }

    function getprojectID() constant returns(uint) {
       return  projectID;
    }

    function getProject(uint _projectID )
    public constant returns  (string projectName, string desc, uint price, uint, uint, string detailsHash, string fileHash)  {
        buyerAddress = buyerAddress;
        projectID =_projectID;
        return (
            projects[projectID].projectName,
            projects[projectID].desc,
            projects[projectID].price,
            projects[projectID].projectState,
            projectID,
            projects[projectID].detailsHash,
            projects[projectID].fileHash
        );
    }

    function createBid (string name, uint proId) payable  {
        bidID = bidIndex.length+1;
        projectID = proId;
        bid[bidID].bidAddress = msg.sender;
        bid[bidID].name = name;
        bid[bidID].amount = msg.value / 2;
        bid[bidID].projectId = proId;
        bid[bidID].bidstate = uint(BidState.OPEN);
        bid[bidID].bidHash = projects[projectID].detailsHash;
        bid[bidID].bidFileHash = projects[projectID].fileHash;
        bidIndex.push(bidID);
    }

    function getbidID() constant returns(uint) {
       return  bidID;
    }

    function getBid(uint bidID)
    constant returns (string name, uint amount, uint, uint, uint proId) {
        return (
            bid[bidID].name,
            bid[bidID].amount,
            bid[bidID].bidstate,
            bidID,
            bid[bidID].projectId
        );
    }

    function acceptBid(uint bidId, uint proId) payable {
        bidID = bidId;
        if (msg.value == bid[bidID].amount*2) {
            bidID = bidId;
            projectID = proId;
            sellerAddress = bid[bidID].bidAddress;
            sellerAddress.transfer((bid[bidID].amount)*2);
            bid[bidID].bidstate = uint(BidState.ACCEPTED);
            projects[projectID].projectState = uint(ProjectState.INPROCESS);
        }
    }

    function getacceptBid() constant returns(uint, uint, uint) {
       return  (
           bid[bidID].bidstate,
           bid[bidID].projectId,
           projects[projectID].projectState
           );
    }

    function itemReceived(uint bidId, uint proId ) {
        buyerAddress == msg.sender;
        bidID = bidId;
        projectID = proId;
        buyerAddress = projects[projectID].projectAddress;
        sellerAddress = bid[bidID].bidAddress;
        sellerAddress.transfer(bid[bidID].amount);
        buyerAddress.transfer(bid[bidID].amount);
        projects[projectID].projectState = uint(ProjectState.CLOSED);
        bid[bidID].bidstate = uint(BidState.CLOSED);
    }

    function geitemReceived() constant returns(uint, uint) {
       return  (bid[bidID].projectId, projects[projectID].projectState);
    }

    function rejectBid(uint bidId)  {
        bidID = bidId;
        sellerAddress = bid[bidID].bidAddress;
        sellerAddress.transfer((bid[bidID].amount)*2);
        bid[bidID].bidstate = uint(BidState.REJECTED);
    }

    function getrejectBid() constant returns(uint) {
       return  bid[bidID].bidstate;
    }

}

