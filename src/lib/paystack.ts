interface PaystackConfig {
  publicKey: string;
  email: string;
  amount: number;
  currency?: string;
  ref: string;
  metadata?: Record<string, any>;
  onSuccess: (reference: any) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: any) => {
        openIframe: () => void;
      };
    };
  }
}

export const initializePaystack = (config: PaystackConfig) => {
  if (!window.PaystackPop) {
    console.error('Paystack library not loaded');
    return null;
  }

  const handler = window.PaystackPop.setup({
    key: config.publicKey,
    email: config.email,
    amount: config.amount * 100,
    currency: config.currency || 'NGN',
    ref: config.ref,
    metadata: config.metadata,
    callback: config.onSuccess,
    onClose: config.onClose,
  });

  return handler;
};

export const generateReference = (prefix: string = 'FV') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${prefix}_${timestamp}_${random}`;
};

export const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.body.appendChild(script);
  });
};

export const getPaystackPublicKey = (): string => {
  const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  if (!key || key === 'pk_test_placeholder') {
    console.warn('Paystack public key not configured. Please add VITE_PAYSTACK_PUBLIC_KEY to your .env file');
  }
  return key || 'pk_test_placeholder';
};
