import { QRCodeCanvas } from 'qrcode.react';

type GenericQRCodeProps = {
  url: string;
  size?: number;
};

const GenericQRCode = ({ url, size = 200 }: GenericQRCodeProps) => (
  <QRCodeCanvas
    title="QR Code"
    value={url}
    size={size}
    fgColor="#000000"
    bgColor="#ffffff"
    level="Q"
    marginSize={4}
  />
);

export default GenericQRCode;
