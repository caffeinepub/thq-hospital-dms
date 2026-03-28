interface QRCodeDisplayProps {
  data: string;
  size?: number;
  label?: string;
  className?: string;
}

export default function QRCodeDisplay({
  data,
  size = 100,
  label,
  className = "",
}: QRCodeDisplayProps) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&color=000000&bgcolor=ffffff`;
  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <img
        src={url}
        alt="QR Code"
        width={size}
        height={size}
        style={{ imageRendering: "pixelated", borderRadius: 6 }}
      />
      {label && (
        <span style={{ fontSize: 10, color: "#aaa", textAlign: "center" }}>
          {label}
        </span>
      )}
    </div>
  );
}
