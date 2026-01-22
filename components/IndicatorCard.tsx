
import React from 'react';

interface IndicatorCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  color?: string;
}

const IndicatorCard: React.FC<IndicatorCardProps> = ({ label, value, unit, icon, color = "text-blue-400" }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-start gap-3 backdrop-blur-sm">
      <div className={`p-2 rounded-lg bg-slate-900 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-slate-100">
          {value} <span className="text-sm font-normal text-slate-500">{unit}</span>
        </p>
      </div>
    </div>
  );
};

export default IndicatorCard;
