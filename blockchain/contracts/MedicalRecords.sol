// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title MedicalRecords
 * @dev Smart contract for storing medical record hashes and medicine verification on blockchain
 */
contract MedicalRecords {
    address public owner;
    
    // Structs
    struct Medicine {
        string id;
        string nameHash;
        string dataHash;
        uint256 timestamp;
        bool verified;
    }
    
    struct DiagnosisRecord {
        string id;
        string dataHash;
        uint256 timestamp;
        address verifier;
    }
    
    // Mappings
    mapping(string => Medicine) public medicines;
    mapping(string => DiagnosisRecord) public diagnoses;
    mapping(address => bool) public authorizedVerifiers;
    
    // Events
    event MedicineVerified(string medicineId, string dataHash, uint256 timestamp);
    event DiagnosisRecorded(string diagnosisId, string dataHash, uint256 timestamp);
    event VerifierAdded(address verifier);
    event VerifierRemoved(address verifier);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyAuthorized() {
        require(msg.sender == owner || authorizedVerifiers[msg.sender], "Not authorized");
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
        authorizedVerifiers[msg.sender] = true;
    }
    
    /**
     * @dev Add a new authorized verifier
     * @param verifier Address of the verifier to add
     */
    function addVerifier(address verifier) public onlyOwner {
        authorizedVerifiers[verifier] = true;
        emit VerifierAdded(verifier);
    }
    
    /**
     * @dev Remove an authorized verifier
     * @param verifier Address of the verifier to remove
     */
    function removeVerifier(address verifier) public onlyOwner {
        require(verifier != owner, "Cannot remove owner as verifier");
        authorizedVerifiers[verifier] = false;
        emit VerifierRemoved(verifier);
    }
    
    /**
     * @dev Verify a medicine on the blockchain
     * @param medicineId Unique identifier of the medicine
     * @param nameHash Hash of the medicine name
     * @param dataHash Hash of the medicine data
     */
    function verifyMedicine(string memory medicineId, string memory nameHash, string memory dataHash) public onlyAuthorized {
        medicines[medicineId] = Medicine({
            id: medicineId,
            nameHash: nameHash,
            dataHash: dataHash,
            timestamp: block.timestamp,
            verified: true
        });
        
        emit MedicineVerified(medicineId, dataHash, block.timestamp);
    }
    
    /**
     * @dev Record a diagnosis hash on the blockchain
     * @param diagnosisId Unique identifier of the diagnosis
     * @param dataHash Hash of the diagnosis data
     */
    function recordDiagnosis(string memory diagnosisId, string memory dataHash) public onlyAuthorized {
        diagnoses[diagnosisId] = DiagnosisRecord({
            id: diagnosisId,
            dataHash: dataHash,
            timestamp: block.timestamp,
            verifier: msg.sender
        });
        
        emit DiagnosisRecorded(diagnosisId, dataHash, block.timestamp);
    }
    
    /**
     * @dev Check if a medicine is verified
     * @param medicineId Unique identifier of the medicine
     * @return bool True if the medicine is verified
     */
    function isMedicineVerified(string memory medicineId) public view returns (bool) {
        return medicines[medicineId].verified;
    }
    
    /**
     * @dev Get medicine hash from the blockchain
     * @param medicineId Unique identifier of the medicine
     * @return string The medicine data hash
     */
    function getMedicineHash(string memory medicineId) public view returns (string memory) {
        require(medicines[medicineId].verified, "Medicine not verified");
        return medicines[medicineId].dataHash;
    }
    
    /**
     * @dev Get diagnosis hash from the blockchain
     * @param diagnosisId Unique identifier of the diagnosis
     * @return string The diagnosis data hash
     */
    function getDiagnosisHash(string memory diagnosisId) public view returns (string memory) {
        require(bytes(diagnoses[diagnosisId].dataHash).length > 0, "Diagnosis not found");
        return diagnoses[diagnosisId].dataHash;
    }
    
    /**
     * @dev Verify if diagnosis data matches stored hash
     * @param diagnosisId Unique identifier of the diagnosis
     * @param dataHash Hash to verify against stored hash
     * @return bool True if hashes match
     */
    function verifyDiagnosisHash(string memory diagnosisId, string memory dataHash) public view returns (bool) {
        string memory storedHash = getDiagnosisHash(diagnosisId);
        return keccak256(abi.encodePacked(storedHash)) == keccak256(abi.encodePacked(dataHash));
    }
}
