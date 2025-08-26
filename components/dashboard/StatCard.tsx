import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  // icon: React.ReactNode;
  color: string;
  bgcolor:string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color, bgcolor }) => {
  
  return (
    <div className={`card transition-shadow hover:shadow-md ${bgcolor} ${color} border-none `}>
      <div className="flex">
        <div className="ml-5">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold ">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;