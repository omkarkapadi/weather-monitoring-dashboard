export function Toast({ message, tone = "info" }) {
  if (!message) {
    return null;
  }
  return (
    <p className={`ui-toast ui-toast-${tone}`} role={tone === "error" ? "alert" : "status"}>
      {message}
    </p>
  );
}
