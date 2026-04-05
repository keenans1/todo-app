export default function Header() {
  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).toUpperCase();

  return (
    <header className="header">
      <h1>Tasks</h1>
      <span className="date-label">{dateLabel}</span>
    </header>
  );
}
