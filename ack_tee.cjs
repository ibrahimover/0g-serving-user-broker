const { ethers } = require("ethers");

async function main() {
    // 配置
    const RPC_URL = "https://evmrpc-testnet.0g.ai";
    const PRIVATE_KEY = "2CE46A1C3B5E5F73EDB79C343BB869EF94709E6BEBB3B29B70937D7B5C6D5751";
    const CONTRACT_ADDRESS = "0x4e4158DF35CfdC0ac63264D3E112F5B8E9a5c569";
    const PROVIDER_ADDRESS = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
    
    // ABI
    const ABI = [
        "function acknowledgeTEESignerByOwner(address provider)",
        "function getService(address provider) view returns (tuple(address provider, string name, string serviceType, string url, uint256 quota, uint256 pricePerToken, uint256 providerStake, bool occupied, address teeSignerAddress, bool teeSignerAcknowledged))",
        "function owner() view returns (address)"
    ];
    
    // 连接
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
    
    console.log("=== 确认 TEE Signer ===");
    console.log("合约地址:", CONTRACT_ADDRESS);
    console.log("Provider 地址:", PROVIDER_ADDRESS);
    console.log("调用者地址:", wallet.address);
    
    // 检查合约 owner
    try {
        const owner = await contract.owner();
        console.log("合约 Owner:", owner);
        console.log("调用者是 Owner:", owner.toLowerCase() === wallet.address.toLowerCase());
    } catch (e) {
        console.log("获取 owner 失败:", e.message);
    }
    
    // 先检查当前服务状态
    console.log("\n=== 当前服务状态 ===");
    try {
        const service = await contract.getService(PROVIDER_ADDRESS);
        console.log("Provider:", service.provider);
        console.log("Name:", service.name);
        console.log("TEE Signer Address:", service.teeSignerAddress);
        console.log("TEE Signer Acknowledged:", service.teeSignerAcknowledged);
    } catch (e) {
        console.log("获取服务失败:", e.message);
    }
    
    // 调用 acknowledgeTEESignerByOwner
    console.log("\n=== 调用 acknowledgeTEESignerByOwner ===");
    try {
        const tx = await contract.acknowledgeTEESignerByOwner(PROVIDER_ADDRESS);
        console.log("交易已发送:", tx.hash);
        console.log("等待确认...");
        const receipt = await tx.wait();
        console.log("交易已确认!");
        console.log("区块号:", receipt.blockNumber);
        console.log("Gas 使用:", receipt.gasUsed.toString());
    } catch (e) {
        console.log("调用失败:", e.message);
        if (e.data) console.log("错误数据:", e.data);
    }
    
    // 再次检查服务状态
    console.log("\n=== 确认后服务状态 ===");
    try {
        const service = await contract.getService(PROVIDER_ADDRESS);
        console.log("TEE Signer Acknowledged:", service.teeSignerAcknowledged);
    } catch (e) {
        console.log("获取服务失败:", e.message);
    }
}

main().catch(console.error);
