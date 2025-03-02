import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Sliders, DollarSign, Home, Lightbulb, ShoppingCart, Car, Heart, Film, PiggyBank, Package } from 'lucide-react';
import './BudgetCalculator.css';

const BudgetCalculator = () => {
  const [income1, setIncome1] = useState(2000);
  const [income2, setIncome2] = useState(2000);
  const [rentRatio, setRentRatio] = useState(3); // Default to 3x (safer budgeting)
  const [customValues, setCustomValues] = useState<Record<string, number>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeInputId, setActiveInputId] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  
  const totalIncome = income1 + income2;
  
  // Calculate recommended rent based on income and ratio
  const recommendedRent = Math.round(totalIncome / rentRatio);

  // Effect to maintain focus across re-renders
  useEffect(() => {
    if (activeInputId && inputRefs.current[activeInputId]) {
      inputRefs.current[activeInputId]?.focus();
    }
  }, [activeInputId, customValues]);
  
  // Effect to enhance slider dragging functionality
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Prevent text selection during slider drag
        e.preventDefault();
      }
    };
    
    // Add global event listeners
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    
    // Clean up event listeners
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging]);
  
  // Handler for starting drag operation
  const handleSliderMouseDown = () => {
    setIsDragging(true);
  };
  
  // Memorized handler to prevent focus loss during re-renders
  const handleSliderChange = useCallback((name: string, value: number, inputId?: string) => {
    setCustomValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Keep track of active input to restore focus after re-render
    if (inputId) {
      setActiveInputId(inputId);
    }
  }, []);

  // Calculate expense categories
  const calculateBudget = () => {
    // Default percentages
    const budgetCategories = [
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

  // Calculate total allocated budget
  const allocatedBudget = budget.reduce((sum, item) => sum + item.value, 0);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: { active?: boolean, payload?: any[] }) => {
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

  // Custom legend with improved focus handling
  const CustomLegend = ({ payload }: { payload: any[] }) => {
    return (
      <div className="legend-container">
        {payload.map((entry, index) => {
          const { name, value, color, icon } = entry;
          const rangeInputId = `range-${name}-${index}`;
          const numberInputId = `number-${name}-${index}`;
          
          return (
            <div 
              key={`item-${index}`}
              className="legend-item"
            >
              <div className="legend-title">
                <div className="legend-color" style={{ backgroundColor: color }}></div>
                <span className="legend-name">
                  {icon} {name}
                </span>
              </div>
              <div className="legend-controls">
                <input
                  id={rangeInputId}
                  ref={(el) => { inputRefs.current[rangeInputId] = el; }}
                  type="range"
                  min="0"
                  max={totalIncome}
                  value={value}
                  onChange={(e) => handleSliderChange(name, parseInt(e.target.value, 10), rangeInputId)}
                  onMouseDown={() => {
                    handleSliderMouseDown();
                    setActiveInputId(rangeInputId);
                  }}
                  onTouchStart={() => {
                    handleSliderMouseDown();
                    setActiveInputId(rangeInputId);
                  }}
                  onFocus={() => setActiveInputId(rangeInputId)}
                />
                <input
                  id={numberInputId}
                  ref={(el) => { inputRefs.current[numberInputId] = el; }}
                  type="number"
                  min="0"
                  max={totalIncome}
                  value={value}
                  className="legend-input"
                  onChange={(e) => handleSliderChange(name, parseInt(e.target.value, 10) || 0, numberInputId)}
                  onFocus={() => setActiveInputId(numberInputId)}
                />
              </div>
              <div className="legend-percentage">
                {(value / totalIncome * 100).toFixed(1)}% of income
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="budget-calculator">
      <div className="header">
        <h1>Couples Budget Calculator</h1>
        <p>Plan your monthly expenses and visualize your budget</p>
      </div>
      
      <div className="container">
        {/* Inputs Section */}
        <div className="inputs-section">
          <h2>
            <DollarSign size={18} /> Income Details
          </h2>
          
          <div className="space-y">
            <div className="input-group">
              <label>
                Your Monthly Income
              </label>
              <div className="relative">
                <span className="dollar-sign">$</span>
                <input
                  type="number"
                  value={income1}
                  onChange={(e) => setIncome1(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div className="input-group">
              <label>
                Partner's Monthly Income
              </label>
              <div className="relative">
                <span className="dollar-sign">$</span>
                <input
                  type="number"
                  value={income2}
                  onChange={(e) => setIncome2(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div className="input-group">
              <label>
                Income to Rent Ratio (Higher = Less Spent on Rent)
              </label>
              <div className="flex-center">
                <input
                  type="range"
                  min="2"
                  max="4"
                  step="0.1"
                  value={rentRatio}
                  onChange={(e) => setRentRatio(parseFloat(e.target.value))}
                  onMouseDown={(e) => e.currentTarget.focus()}
                />
                <span className="ratio-display">{rentRatio.toFixed(1)}x</span>
              </div>
            </div>
            
            <div className="card blue-card">
              <h3>
                <Home size={16} /> Recommended Rent
              </h3>
              <p className="large">{formatCurrency(recommendedRent)}</p>
              <p className="text-sm">
                {(recommendedRent / totalIncome * 100).toFixed(1)}% of your income
              </p>
            </div>
            
            <div className="card green-card">
              <h3>Total Monthly Income</h3>
              <p className="large">{formatCurrency(totalIncome)}</p>
              <div className="border-top text-sm">
                <div className="flex-between">
                  <span>Allocated:</span>
                  <span>{formatCurrency(allocatedBudget)}</span>
                </div>
                <div className="flex-between">
                  <span>
                    {totalIncome >= allocatedBudget ? "Remaining:" : "Overspent:"}
                  </span>
                  <span className={totalIncome >= allocatedBudget ? "" : "text-red"}>
                    {formatCurrency(Math.abs(totalIncome - allocatedBudget))}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="button"
            >
              <Sliders size={16} />
              {showAdvanced ? "Hide" : "Show"} Budget Allocation Controls
            </button>
          </div>
        </div>
        
        {/* Chart Section */}
        <div className="chart-section">
          <div>
            <h2>Monthly Budget Breakdown</h2>
            <p>
              Drag the sliders below to customize your budget allocation
            </p>
          </div>
          
          <div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budget}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="90%"
                    innerRadius="30%"
                    dataKey="value"
                    animationDuration={500}
                  >
                    {budget.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {showAdvanced && (
              <div>
                <CustomLegend payload={budget} />
              </div>
            )}
            
            {!showAdvanced && (
              <div className="category-grid">
                {budget.map((item, index) => (
                  <div 
                    key={index} 
                    className="category-item"
                    style={{ borderColor: item.color }}
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
    </div>
  );
};

export default BudgetCalculator; 