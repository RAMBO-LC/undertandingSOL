const CONTRACT_ADDRESS = "0xa2F6522d955686368d320c38394a98EE192D669b";
const ABI = [
    "function setMessage(string memory _message) public",
    "function getMessage() public view returns (string memory)"
];
const SEPOLIA = "0xaa36a7";

let contract = null;

// ── UI helpers ────────────────────────────────────────────────
function setStatus(msg, type = "") {
    const bar = document.getElementById("statusBar");
    bar.className = type ? `connected ${type}` : "";
    if (type === "connected") bar.className = "connected";
    if (type === "error") bar.className = "error";
    document.getElementById("statusText").textContent = msg;
}

function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    btn.disabled = loading;
    btn.classList.toggle("loading", loading);
}

function showMessage(text) {
    document.getElementById("showMsg").textContent = text;
    document.getElementById("messageDisplay").className = "visible";
}

// ── Contract init ─────────────────────────────────────────────
async function initContract() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}

// ── Check wallet on load ──────────────────────────────────────
async function checkWallet() {
    if (!window.ethereum) {
        setStatus("MetaMask not installed", "error");
        return;
    }
    try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
            await initContract();
            setStatus("Wallet connected · " + accounts + "connected");
        } else {
            setStatus("Wallet not connected");
        }
    } catch (err) {
        console.error("checkWallet:", err);
        setStatus("Could not read wallet", "error");
    }
}

// ── Connect ───────────────────────────────────────────────────
async function connect() {
    if (!window.ethereum) return setStatus("Install MetaMask first", "error");
    setLoading("connectWallet", true);
    try {
        // 1. Trigger popup FIRST (user gesture required)
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // 2. Check chain AFTER accounts granted
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        if (chainId !== SEPOLIA) {
            try {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: SEPOLIA }]
                });
            } catch (switchErr) {
                setStatus("Switch to Sepolia in MetaMask", "error");
                return;
            }
        }

        await initContract();
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        setStatus("Connected · " + accounts[0].slice(0, 6) + "..." + accounts[0].slice(-4), "connected");

    } catch (err) {
        if (err.code === 4001) {
            setStatus("Connection rejected", "error");
        } else {
            setStatus("Error: " + err.message, "error");
            console.error(err);
        }
    } finally {
        setLoading("connectWallet", false);
    }
}

// ── Send message ──────────────────────────────────────────────
async function sendMessage() {
    if (!contract) return setStatus("Connect wallet first", "error");
    const msg = document.getElementById("messageInput").value.trim();
    if (!msg) return setStatus("Enter a message first", "error");

    setLoading("sendMessage", true);
    try {
        const tx = await contract.setMessage(msg);
        setStatus("Waiting for confirmation...", "connected");
        await tx.wait();
        setStatus("Saved on blockchain ✅", "connected");
        document.getElementById("messageInput").value = "";
    } catch (err) {
        if (err.code === 4001) {
            setStatus("Transaction rejected", "error");
        } else {
            setStatus("TX failed: " + err.message, "error");
            console.error(err);
        }
    } finally {
        setLoading("sendMessage", false);
    }
}

// ── Get message ───────────────────────────────────────────────
async function getMessage() {
    if (!contract) return setStatus("Connect wallet first", "error");

    setLoading("getMessage", true);
    try {
        const message = await contract.getMessage();
        showMessage(message || "(empty — no message stored yet)");
        setStatus("Message loaded ✅", "connected");
    } catch (err) {
        setStatus("Failed to read: " + err.message, "error");
        console.error(err);
    } finally {
        setLoading("getMessage", false);
    }
}

// ── Account / chain change listeners ──────────────────────────
window.ethereum?.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
        contract = null;
        setStatus("Wallet disconnected");
    } else {
        initContract().then(() =>
            setStatus("Account changed · " + accounts, "connected")
        );
    }
});

window.ethereum?.on("chainChanged", () => {
    setStatus("Network changed — reconnect", "error");
    contract = null;
});

// ── Wire buttons ──────────────────────────────────────────────
document.getElementById("connectWallet").onclick = connect;
document.getElementById("sendMessage").onclick = sendMessage;
document.getElementById("getMessage").onclick = getMessage;

// ── Init ──────────────────────────────────────────────────────
checkWallet().catch(console.error);