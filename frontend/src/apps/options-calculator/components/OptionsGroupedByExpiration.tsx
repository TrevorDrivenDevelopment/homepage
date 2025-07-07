import { createSignal, For, Show, createMemo } from 'solid-js';
import { OptionQuote, StockQuote } from '../enhancedOptionsService';
import { OptionsTable } from './OptionsTable';

interface OptionsGroupedByExpirationProps {
  options: OptionQuote[];
  stockQuote: StockQuote | null;
  onOptionClick: (option: OptionQuote) => void;
  bestAtPercentages: Map<number, { option: OptionQuote; profit: number }>;
  optionType: 'call' | 'put';
  investmentAmount: string;
  percentageIncrements: string;
}

export const OptionsGroupedByExpiration = (props: OptionsGroupedByExpirationProps) => {
  // Group options by expiration date
  const groupedOptions = createMemo(() => {
    return props.options.reduce((groups, option) => {
      const expiration = option.expiration;
      if (!groups[expiration]) {
        groups[expiration] = [];
      }
      groups[expiration].push(option);
      return groups;
    }, {} as Record<string, OptionQuote[]>);
  });

  // Sort expiration dates chronologically
  const sortedExpirations = createMemo(() => {
    return Object.keys(groupedOptions()).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
  });

  // Default to expanding the first (nearest) expiration
  const [expandedPanel, setExpandedPanel] = createSignal<string>('');

  // Initialize with first expiration when data loads
  const _initializeExpanded = createMemo(() => {
    const expirations = sortedExpirations();
    if (expirations.length > 0 && !expandedPanel()) {
      setExpandedPanel(expirations[0]);
    }
  });

  const handleAccordionChange = (expiration: string) => {
    setExpandedPanel(expandedPanel() === expiration ? '' : expiration);
  };

  const getDaysToExpiry = (expiration: string) => {
    const daysToExpiry = Math.ceil((new Date(expiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysToExpiry;
  };

  const formatExpirationDate = (expiration: string) => {
    return new Date(expiration).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function for rounding midpoint up (same as in useOptionsCalculation)
  const roundMidpointUp = (bid: number, ask: number): number => {
    const midpoint = (bid + ask) / 2;
    return Math.ceil(midpoint * 100) / 100;
  };

  // Calculate best options for a specific expiration date group using the same logic as global calculation
  const getBestOptionsForExpiration = (expirationOptions: OptionQuote[]) => {
    if (!props.stockQuote) return new Map();
    
    const percentages = props.percentageIncrements.split(',').map(p => parseFloat(p.trim()));
    const investment = parseFloat(props.investmentAmount) || 10000;
    const bestForExpiration = new Map<number, { option: OptionQuote; profit: number }>();
    
    percentages.forEach(percentage => {
      const targetPrice = props.optionType === 'call' 
        ? props.stockQuote!.price * (1 + percentage / 100)
        : props.stockQuote!.price * (1 - percentage / 100);
      let bestOption: OptionQuote | null = null;
      let bestProfit = -Infinity;
      
      expirationOptions.forEach((option: OptionQuote) => {
        const premiumPaid = roundMidpointUp(option.bid, option.ask);
        const contractsAffordable = Math.floor(investment / (premiumPaid * 100));
        
        if (contractsAffordable > 0 && contractsAffordable <= 10000) { // Reasonable contract limit
          let optionValue = 0;
          if (props.optionType === 'call') {
            optionValue = Math.max(0, targetPrice - option.strike);
          } else {
            optionValue = Math.max(0, option.strike - targetPrice);
          }
          
          const profitPerShare = optionValue - premiumPaid;
          const totalProfit = profitPerShare * 100 * contractsAffordable;
          
          // Sanity check for unrealistic profits (over $1M suggests data issue)
          if (Math.abs(totalProfit) < 1000000 && totalProfit > bestProfit) {
            bestProfit = totalProfit;
            bestOption = option;
          }
        }
      });
      
      if (bestOption) {
        bestForExpiration.set(percentage, { option: bestOption, profit: bestProfit });
      }
    });
    
    return bestForExpiration;
  };

  const getChipColor = (daysToExpiry: number) => {
    if (daysToExpiry <= 7) return { "background-color": '#d32f2f', color: 'white' };
    if (daysToExpiry <= 30) return { "background-color": '#ed6c02', color: 'white' };
    return { "background-color": '#f5f5f5', color: '#666' };
  };

  return (
    <Show 
      when={sortedExpirations().length > 0}
      fallback={
        <div style={{ 
          "text-align": "center", 
          padding: "32px 0",
          color: "#666",
          "font-size": "0.875rem"
        }}>
          No {props.optionType} options available
        </div>
      }
    >
      <div>
        <For each={sortedExpirations()}>
          {(expiration) => {
            const expirationOptions = groupedOptions()[expiration];
            const daysToExpiry = getDaysToExpiry(expiration);
            const isExpanded = () => expandedPanel() === expiration;
            
            // Calculate best options for this specific expiration date
            const bestForThisExpiration = getBestOptionsForExpiration(expirationOptions);
            const bestOptionsInGroup = bestForThisExpiration.size;

            return (
              <div style={{
                "margin-bottom": "8px",
                border: "1px solid #e0e0e0",
                "border-radius": "4px",
                "box-shadow": "0 1px 3px rgba(0,0,0,0.12)"
              }}>
                <button
                  onClick={() => handleAccordionChange(expiration)}
                  style={{
                    width: "100%",
                    background: isExpanded() ? "#f5f5f5" : "white",
                    border: "none",
                    padding: "16px",
                    cursor: "pointer",
                    "text-align": "left",
                    display: "flex",
                    "justify-content": "space-between",
                    "align-items": "center",
                    "min-height": "64px",
                    "border-radius": "4px"
                  }}
                  onMouseEnter={(e) => {
                    if (!isExpanded()) {
                      e.currentTarget.style.backgroundColor = "#f0f0f0";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isExpanded()) {
                      e.currentTarget.style.backgroundColor = "white";
                    }
                  }}
                >
                  <div style={{ 
                    display: "flex", 
                    "align-items": "center", 
                    gap: "16px" 
                  }}>
                    <h4 style={{ 
                      margin: "0",
                      "font-size": "1.25rem",
                      "font-weight": "500"
                    }}>
                      {formatExpirationDate(expiration)}
                    </h4>
                    <span style={{
                      ...getChipColor(daysToExpiry),
                      padding: "4px 8px",
                      "border-radius": "16px",
                      "font-size": "0.75rem",
                      border: daysToExpiry > 30 ? "1px solid #ccc" : "none"
                    }}>
                      {daysToExpiry} days
                    </span>
                  </div>
                  <div style={{ 
                    display: "flex", 
                    "align-items": "center", 
                    gap: "8px" 
                  }}>
                    <span style={{
                      "background-color": "#f5f5f5",
                      color: "#666",
                      padding: "4px 8px",
                      "border-radius": "16px",
                      "font-size": "0.75rem",
                      border: "1px solid #ccc"
                    }}>
                      {expirationOptions.length} contracts
                    </span>
                    <Show when={bestOptionsInGroup > 0}>
                      <span style={{
                        "background-color": "#1976d2",
                        color: "white",
                        padding: "4px 8px",
                        "border-radius": "16px",
                        "font-size": "0.75rem"
                      }}>
                        {bestOptionsInGroup} best
                      </span>
                    </Show>
                    <svg 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                      style={{
                        transform: isExpanded() ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s"
                      }}
                    >
                      <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
                    </svg>
                  </div>
                </button>
                
                <Show when={isExpanded()}>
                  <div style={{ padding: "0" }}>
                    <OptionsTable
                      options={expirationOptions}
                      stockQuote={props.stockQuote}
                      onOptionClick={props.onOptionClick}
                      bestAtPercentages={bestForThisExpiration}
                      optionType={props.optionType}
                    />
                  </div>
                </Show>
              </div>
            );
          }}
        </For>
      </div>
    </Show>
  );
};
