
import { TransactionDetails } from './types';

// Parse ABI string to JSON
export const parseABI = (abiString: string) => {
  try {
    const parsedABI = JSON.parse(abiString);
    return parsedABI;
  } catch (error) {
    console.error('Failed to parse ABI:', error);
    return null;
  }
};

// Get contract functions from ABI
export const getContractFunctions = (abi) => {
  return abi.filter((item) => item.type === 'function');
};

// Create shareable link
export const createShareableLink = (transactionDetails: TransactionDetails) => {
  const baseUrl = window.location.origin;
  const txData = encodeURIComponent(btoa(JSON.stringify(transactionDetails)));
  
  // Log analytics for link creation
  logTransactionEvent('transaction_link_created', {
    contractAddress: transactionDetails.contractAddress,
    chainId: transactionDetails.chainId,
    functionName: transactionDetails.functionName,
  });
  
  return `${baseUrl}/transaction/${txData}`;
};

// Decode transaction from URL
export const decodeTransactionFromUrl = (
  urlParam: string
): TransactionDetails | null => {
  try {
    // Check if the urlParam is actually the URL pattern parameter
    if (urlParam === ':txData') {
      console.warn('Invalid URL parameter: :txData');
      return null;
    }
    
    // Some URLs might have extra slashes or encoding issues
    const cleanedParam = decodeURIComponent(urlParam);
    const decoded = JSON.parse(atob(cleanedParam));
    
    // Validate the decoded object has required fields
    if (!decoded.contractAddress || !decoded.chainId || !decoded.functionName) {
      console.warn('Decoded transaction missing required fields');
      return null;
    }
    
    return decoded as TransactionDetails;
  } catch (error) {
    console.error('Failed to decode transaction from URL:', error);
    return null;
  }
};

// Log page view to track user activity
export const logPageView = (pageName: string, additionalData = {}) => {
  console.log(`[Analytics] Page View: ${pageName}`);
  
  try {
    const pageViewData = {
      timestamp: new Date().toISOString(),
      page: pageName,
      path: window.location.pathname,
      ...additionalData,
    };
    
    // Record page load to backend
    recordPageLoadToBackend(pageViewData);
  } catch (error) {
    console.error('Failed to log page view:', error);
  }
};

// Log transaction event for analytics
export const logTransactionEvent = (event: string, data: any) => {
  console.log(`[Analytics] ${event}:`, data);

  try {
    const analyticsData = {
      timestamp: new Date().toISOString(),
      event,
      data,
    };

    // Record event to analytics service
    recordAnalyticsEvent(analyticsData);
  } catch (error) {
    console.error('Failed to log analytics event:', error);
  }
};

// Record analytics event to backend
export const recordAnalyticsEvent = async (data: any) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    await fetch(`${apiUrl}/api/analytics/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: data.event,
        data: data.data,
      }),
      keepalive: true,
    });
  } catch (error) {
    console.error('Failed to record analytics event to backend:', error);
  }
};

// Record page load event specifically
export const recordPageLoadToBackend = async (data: any) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    await fetch(`${apiUrl}/api/analytics/pageload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      keepalive: true,
    });
  } catch (error) {
    console.error('Failed to record page load to backend:', error);
  }
};

// Get analytics data from backend API
export const getAnalyticsData = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/analytics/pageloads`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Format the timestamps properly
    return data.map((item: any) => ({
      ...item,
      timeKey: new Date(item.timeKey).toISOString()
    }));
  } catch (error) {
    console.error('Failed to get analytics data from backend:', error);
    return [];
  }
};
