export default function FormCard({ title, children }) {
  return (
    <div className="bg-white shadow-md rounded-2xl p-6 space-y-6">
      <h2 className="text-xl font-semibold border-b pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}