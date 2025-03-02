import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Sliders, DollarSign, Home, Lightbulb, ShoppingCart, Car, Heart, Film, PiggyBank, Package, PieChart } from 'lucide-react';
import './BudgetCalculator.css';

// Define interfaces for type safety
interface CustomValues {
  [key: string]: number;
}

interface BudgetItem {
  name: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: BudgetItem;
  }>;
}

interface LegendProps {
  payload?: Array<{
    payload: BudgetItem;
  }>;
}

const BudgetCalculator: React.FC = () => {
  const [income1, setIncome1] = useState<number>(2000);
  const [income2, setIncome2] = useState<number>(2000);
  const [rentRatio, setRentRatio] = useState<number>(3); // Default to 3x (safer budgeting)
  const [customValues, setCustomValues] = useState<CustomValues>({});
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  
  const totalIncome = income1 + income2;
  
  // Calculate recommended rent based on income and ratio
  const recommendedRent = Math.round(totalIncome / rentRatio);

  // Simplified handler for slider changes
  const handleValueChange = (category: string, value: number) => {
    setCustomValues(prev => ({
      ...prev,
      [category]: value
    }));
  };

  // Calculate expense categories
  const calculateBudget = () => {
    // Default percentages
    const budgetCategories: BudgetItem[] = [
      { 
        name: 'Rent', 
        value: customValues.Rent !== undefined ? customValues.Rent : recommendedRent,
        color: '#FF6384',
        icon: <Home size={16} />
      },
      { 
        name: 'Utilities', 
        value: customValues.Utilities !== undefined ? customValues.Utilities : Math.round(totalIncome * 0.08),
        color: '#36A2EB',
        icon: <Lightbulb size={16} />
      },
      { 
        name: 'Groceries', 
        value: customValues.Groceries !== undefined ? customValues.Groceries : Math.round(totalIncome * 0.12),
        color: '#FFCE56',
        icon: <ShoppingCart size={16} />
      },
      { 
        name: 'Transportation', 
        value: customValues.Transportation !== undefined ? customValues.Transportation : Math.round(totalIncome * 0.10),
        color: '#4BC0C0',
        icon: <Car size={16} />
      },
      { 
        name: 'Healthcare', 
        value: customValues.Healthcare !== undefined ? customValues.Healthcare : Math.round(totalIncome * 0.06),
        color: '#9966FF',
        icon: <Heart size={16} />
      },
      { 
        name: 'Entertainment', 
        value: customValues.Entertainment !== undefined ? customValues.Entertainment : Math.round(totalIncome * 0.07),
        color: '#FF9F40',
        icon: <Film size={16} />
      },
      { 
        name: 'Savings', 
        value: customValues.Savings !== undefined ? customValues.Savings : Math.round(totalIncome * 0.15),
        color: '#4CAF50',
        icon: <PiggyBank size={16} />
      },
      { 
        name: 'Miscellaneous', 
        value: customValues.Miscellaneous !== undefined ? customValues.Miscellaneous : Math.round(totalIncome * 0.06),
        color: '#9C27B0',
        icon: <Package size={16} />
      }
    ];

    // Recalculate percentages based on the new total
    const calculatedTotal = budgetCategories.reduce((sum, item) => sum + item.value, 0);
    const remaining = totalIncome - calculatedTotal;

    // Add remaining if not zero
    if (Math.abs(remaining) > 0) {
      budgetCategories.push({
        name: remaining > 0 ? 'Unallocated' : 'Overspent',
        value: Math.abs(remaining),
        color: remaining > 0 ? '#607D8B' : '#F44336',
        icon: <DollarSign size={16} />
      });
    }

    return budgetCategories;
  };
  
  const budget = calculateBudget();
  
  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Custom tooltip for pie chart
  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="tooltip">
          <p className="tooltip-title">
            <span style={{ color: data.color }}>{data.icon}</span> {data.name}
          </p>
          <p className="tooltip-value">{formatCurrency(data.value)}</p>
          <p className="tooltip-percentage">
            {(data.value / totalIncome * 100).toFixed(1)}% of income
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="budget-calculator">
      <div className="header">
        <h1>Budget Calculator</h1>
        <p>Plan your monthly expenses and visualize your budget</p>
      </div>
      
      <div className="container">
        <div className="inputs-section">
          <h2>Income Details</h2>
          
          <div className="space-y">
            <div className="input-group">
              <label>Your Monthly Income</label>
              <div className="relative">
                <span className="dollar-sign">$</span>
                <input
                  type="number"
                  value={income1}
                  onChange={(e) => setIncome1(Number(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div className="input-group">
              <label>Partner's Monthly Income</label>
              <div className="relative">
                <span className="dollar-sign">$</span>
                <input
                  type="number"
                  value={income2}
                  onChange={(e) => setIncome2(Number(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div className="input-group">
              <label>Income to Rent Ratio</label>
              <div className="flex-center">
                <input
                  type="range"
                  min="2"
                  max="4"
                  step="0.1"
                  value={rentRatio}
                  onChange={(e) => setRentRatio(Number(e.target.value))}
                />
                <span className="ratio-display">{rentRatio.toFixed(1)}x</span>
              </div>
            </div>
          </div>
          
          <div className="card blue-card">
            <h3>Recommended Rent</h3>
            <p className="large">{formatCurrency(recommendedRent)}</p>
          </div>
          
          <button 
            className="button" 
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Sliders size={16} />
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </button>
        </div>
        
        <div className="chart-section">
          <h2>Budget Breakdown</h2>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsChart>
                <Pie
                  data={budget}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {budget.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RechartsChart>
            </ResponsiveContainer>
          </div>
          
          {/* Budget item sliders */}
          {showAdvanced && (
            <div className="budget-items">
              {budget.map((item, index) => (
                <div key={`budget-item-${index}`} className="budget-item">
                  <div className="item-header">
                    <div className="item-icon" style={{ backgroundColor: item.color }}>
                      {item.icon}
                    </div>
                    <div className="item-name">{item.name}</div>
                    <div className="item-value">{formatCurrency(item.value)}</div>
                  </div>
                  <div className="item-slider">
                    <input 
                      type="range"
                      min="0"
                      max={totalIncome}
                      value={item.value}
                      onChange={(e) => handleValueChange(item.name, Number(e.target.value))}
                      className="item-range"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!showAdvanced && (
            <div className="category-grid">
              {budget.map((item, index) => (
                <div
                  key={`category-${index}`}
                  className="category-item"
                >
                  <div className="color-dot" style={{ backgroundColor: item.color }}></div>
                  <div className="category-text">
                    <span className="category-name">
                      {item.icon} {item.name}
                    </span>
                    <span className="category-value">{formatCurrency(item.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetCalculator; 