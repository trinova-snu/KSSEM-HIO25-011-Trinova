import React from 'react';

interface NutritionPieChartProps {
    data: {
        carbohydrates: number;
        proteins: number;
        fats: number;
        vitaminsAndMinerals: number;
    };
}

const COLORS = {
    carbohydrates: '#ed8936', // primary
    proteins: '#f56565',      // danger
    fats: '#f6e05e',          // accent
    vitaminsAndMinerals: '#4299e1', // secondary
};

const PieSlice: React.FC<{ percentage: number; startAngle: number; color: string; radius: number }> = ({ percentage, startAngle, color, radius }) => {
    const endAngle = startAngle + (percentage / 100) * 360;
    const largeArcFlag = percentage > 50 ? 1 : 0;

    const startX = radius + radius * Math.cos((startAngle * Math.PI) / 180);
    const startY = radius + radius * Math.sin((startAngle * Math.PI) / 180);
    const endX = radius + radius * Math.cos((endAngle * Math.PI) / 180);
    const endY = radius + radius * Math.sin((endAngle * Math.PI) / 180);

    const d = `M ${radius},${radius} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY} Z`;

    return <path d={d} fill={color} />;
};


const NutritionPieChart: React.FC<NutritionPieChartProps> = ({ data }) => {
    const radius = 50;
    let accumulatedAngle = 0;

    const chartData = [
        { name: 'Carbohydrates', value: data.carbohydrates, color: COLORS.carbohydrates },
        { name: 'Proteins', value: data.proteins, color: COLORS.proteins },
        { name: 'Fats', value: data.fats, color: COLORS.fats },
        { name: 'Vitamins & Minerals', value: data.vitaminsAndMinerals, color: COLORS.vitaminsAndMinerals },
    ].filter(item => item.value > 0);

    return (
        <div className="p-4 bg-dark-bg rounded-lg border border-border-color">
            <h4 className="font-semibold text-text-light mb-4 text-center">Nutritional Breakdown</h4>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="w-40 h-40 flex-shrink-0">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                        {chartData.map((item) => {
                            const slice = <PieSlice key={item.name} percentage={item.value} startAngle={accumulatedAngle} color={item.color} radius={radius} />;
                            accumulatedAngle += (item.value / 100) * 360;
                            return slice;
                        })}
                    </svg>
                </div>
                <ul className="space-y-2 w-full sm:w-52">
                    {chartData.map(item => (
                         <li key={item.name} className="flex items-center justify-between gap-3 text-sm">
                            <div className="flex items-center gap-3">
                                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></span>
                                <span className="text-text-light font-medium whitespace-nowrap">{item.name}:</span>
                            </div>
                            <span className="text-text-dark font-bold">{item.value}%</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default NutritionPieChart;