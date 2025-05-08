import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'red';
  isLoading?: boolean;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  isLoading = false,
  subtitle
}) => {
  // Color classes based on the color prop
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600'
  };
  
  // Skeleton loader for the loading state
  const SkeletonLoader = () => (
    <div className="animate-pulse flex space-x-4 w-full">
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-6 bg-gray-200 rounded w-5/6"></div>
        {subtitle && <div className="h-3 bg-gray-200 rounded w-1/2"></div>}
      </div>
      <div className="rounded-full bg-gray-200 h-12 w-12"></div>
    </div>
  );
  
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <SkeletonLoader />
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard; 