import FactoryPieChart from "./FactoryPieChart";

export default function FactoryGrid({ factories, factoryData }) {
  return (
    <div className="factory-grid">
      {factories.map((factory, index) => (
        <FactoryPieChart
          key={index}
          factoryName={factory.name}
          data={factoryData[factory.name] || []}
        />
      ))}
    </div>
  );
}