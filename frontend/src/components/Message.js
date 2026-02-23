export default function Message({ type = "success", text }) {
  if (!text) return null;

  const baseStyle = {
    padding: "12px 14px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 500,
    marginBottom: "16px",
    lineHeight: 1.5,
  };

  const variants = {
    success: {
      backgroundColor: "#ecfdf5",
      color: "#065f46",
      border: "1px solid #6ee7b7",
    },
    error: {
      backgroundColor: "#fef2f2",
      color: "#991b1b",
      border: "1px solid #fecaca",
    },
  };

  const style = {
    ...baseStyle,
    ...(variants[type] || variants.success),
  };

  return <div style={style}>{text}</div>;
}