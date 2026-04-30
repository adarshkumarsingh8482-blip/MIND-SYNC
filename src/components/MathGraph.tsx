import { memo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis 
} from 'recharts';

interface GraphData {
  type: 'line' | 'scatter';
  title: string;
  data: any[];
  xAxis: string;
  yAxis: string;
}

export const MathGraph = memo(function MathGraph({ graph }: { graph: GraphData }) {
  return (
    <div className="w-full h-64 bg-zinc-900/50 border border-math-line rounded-sm p-4 my-4">
      <h4 className="text-[10px] uppercase font-mono mb-2 text-math-accent tracking-widest">{graph.title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        {graph.type === 'line' ? (
          <LineChart data={graph.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis 
              dataKey={graph.xAxis} 
              stroke="#FAFAFA" 
              fontSize={10} 
              tick={{ fill: '#FAFAFA' }}
            />
            <YAxis 
              stroke="#FAFAFA" 
              fontSize={10} 
              tick={{ fill: '#FAFAFA' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', fontSize: '10px' }}
              itemStyle={{ color: '#3B82F6' }}
            />
            <Line 
              type="monotone" 
              dataKey={graph.yAxis} 
              stroke="#3B82F6" 
              strokeWidth={2} 
              dot={false} 
              animationDuration={1000}
            />
          </LineChart>
        ) : (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis 
              dataKey={graph.xAxis} 
              stroke="#FAFAFA" 
              fontSize={10} 
              type="number"
            />
            <YAxis 
              dataKey={graph.yAxis} 
              stroke="#FAFAFA" 
              fontSize={10} 
              type="number"
            />
            <ZAxis range={[20, 20]} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', fontSize: '10px' }}
            />
            <Scatter name={graph.title} data={graph.data} fill="#3B82F6" />
          </ScatterChart>
        )}
      </ResponsiveContainer>
    </div>
  );
});
