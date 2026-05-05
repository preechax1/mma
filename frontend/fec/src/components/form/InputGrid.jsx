export default function InputGrid({ children }) {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      {children}
    </div>
  );
}