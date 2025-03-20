

export const chainIdToName: Record<string, string> = {
    "137": "Polygon",
    "42161": "Arbitrum",
    "8453": "Base",
    "23434": "Starknet",
  };

export const getChainName = (chainId: string): string => {
    return chainIdToName[chainId] || "Unknown Chain";
  };