const CONTRACT_ADDRESS = "0xa2F6522d955686368d320c38394a98EE192D669b";
const ABI = [
    "function setMessage(string memory _message) public",
    "function getMessage() public view returns(string memory)"
];
const SEPOLIA = "0xaa36a7";

let contract;


async function checkWallet() {
    const accounts = await window.ethereum.request({
        method: "eth_accounts"
    });

    if (accounts.length > 0) {
        alert("wallet connected");
        return;
    }
    alert("wallet Not Connected");
}

checkWallet()

async function connect() {
    if (!window.ethereum) return alert("Install MetaMask");

    if (await window.ethereum.request({ method: "eth_chainId" }) !== SEPOLIA) {
        await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: SEPOLIA }] })
            .catch(() => alert("Switch to Sepolia manually"));
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    const signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    alert("Wallet Connected ");
}

async function sendMessage() {
    if (!contract) return alert("Connect wallet first!");
    const msg = document.getElementById("messageInput").value;
    if (!msg) return alert("Enter a message");
    const tx = await contract.setMessage(msg);
    await tx.wait();
    alert("Saved on Blockchain ✅");
}

async function getMessage() {
    if (!contract) return alert("Connect wallet first!");
    document.getElementById("showMsg").innerText = await contract.getMessage();
}

document.getElementById("connectWallet").onclick = connect;
document.getElementById("sendMessage").onclick = sendMessage;
document.getElementById("getMessage").onclick = getMessage;