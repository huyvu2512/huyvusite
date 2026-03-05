import React from 'react';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

export const DonutChart: React.FC<{ data: ChartData[]; size?: number; hollow?: boolean }> = ({ 
    data, 
    size = 100,
    hollow = false
}) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  
  // If total is 0, render a gray placeholder circle
  if (total === 0) {
      const r = size / 2;
      const center = size / 2;
      const innerR = hollow ? r * 0.6 : 0;
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
             <path 
                d={`M ${center} ${center - r} A ${r} ${r} 0 1 1 ${center} ${center + r} A ${r} ${r} 0 1 1 ${center} ${center - r} Z ${hollow ? `M ${center} ${center - innerR} A ${innerR} ${innerR} 0 1 0 ${center} ${center + innerR} A ${innerR} ${innerR} 0 1 0 ${center} ${center - innerR} Z` : ''}`} 
                fill="#f3f4f6" 
                fillRule="evenodd"
            />
        </svg>
      );
  }

  let currentAngle = 0;
  const radius = size / 2;
  const center = size / 2;
  const holeRadius = hollow ? radius * 0.6 : 0;

  const createSlicePath = (startAngle: number, endAngle: number, r: number, innerR: number) => {
    const x1 = center + r * Math.cos(Math.PI * startAngle / 180);
    const y1 = center + r * Math.sin(Math.PI * startAngle / 180);
    const x2 = center + r * Math.cos(Math.PI * endAngle / 180);
    const y2 = center + r * Math.sin(Math.PI * endAngle / 180);
    
    const x3 = center + innerR * Math.cos(Math.PI * endAngle / 180);
    const y3 = center + innerR * Math.sin(Math.PI * endAngle / 180);
    const x4 = center + innerR * Math.cos(Math.PI * startAngle / 180);
    const y4 = center + innerR * Math.sin(Math.PI * startAngle / 180);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    if (endAngle - startAngle >= 360) {
        return `M ${center - r} ${center} A ${r} ${r} 0 1 1 ${center + r} ${center} A ${r} ${r} 0 1 1 ${center - r} ${center} Z ${hollow ? `M ${center - innerR} ${center} A ${innerR} ${innerR} 0 1 0 ${center + innerR} ${center} A ${innerR} ${innerR} 0 1 0 ${center - innerR} ${center} Z` : ''}`;
    }

    if (innerR === 0) {
        return `M ${center} ${center} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    } else {
        return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
    }
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((item, idx) => {
        const angle = (item.value / total) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle += angle;
        
        if (item.value <= 0) return null;

        return (
          <path
            key={idx}
            d={createSlicePath(startAngle - 90, endAngle - 90, radius, holeRadius)}
            fill={item.color}
            stroke="white"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
};

export const BarChart: React.FC<{ data: ChartData[] }> = ({ data }) => {
    const max = Math.max(...data.map(d => d.value)) || 1;
    
    return (
        <div className="flex items-end justify-between h-full w-full gap-2">
            {data.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 group h-full justify-end">
                    <div className="w-full flex-1 flex items-end justify-center">
                        <div 
                            className="w-full rounded-t-sm transition-all duration-500 ease-out group-hover:opacity-80 relative"
                            style={{ 
                                height: `${Math.max((item.value / max) * 100, 1)}%`, // Ensure minimal height 
                                backgroundColor: item.color 
                            }}
                        >
                        </div>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 truncate w-full text-center">{item.label}</span>
                </div>
            ))}
        </div>
    );
};