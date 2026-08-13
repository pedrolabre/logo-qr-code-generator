import { useEffect, useRef } from 'react';
import { buildQRCodeOptions, createQRCodeInstance } from '../lib/qr';

export const useQrCode = (config, logoDataUrl) => {
  const qrContainerRef = useRef(null);
  const qrInstanceRef = useRef(null);

  useEffect(() => {
    const instance = createQRCodeInstance(config, logoDataUrl);

    qrInstanceRef.current = instance;

    if (qrContainerRef.current) {
      instance.append(qrContainerRef.current);
    }

    return () => {
      qrInstanceRef.current = null;

      if (qrContainerRef.current) {
        qrContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  useEffect(() => {
    if (!qrInstanceRef.current) {
      return;
    }

    const nextOptions = buildQRCodeOptions(config, logoDataUrl);

    qrInstanceRef.current.update(nextOptions);
  }, [config, logoDataUrl]);

  return { qrContainerRef, qrInstanceRef };
};
