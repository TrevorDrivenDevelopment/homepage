import { Show, createMemo } from 'solid-js';
import { StockQuote, OptionQuote } from '../enhancedOptionsService';
import { OptionsGroupedByExpiration } from './OptionsGroupedByExpiration';
import { BestOptionsSummary } from './BestOptionsSummary';
import { OptionDetailsView } from './OptionDetailsView';

interface LiveOptionsChainProps {
  callsChain: OptionQuote[];
  putsChain: OptionQuote[];
  stockQuote: StockQuote;
  selectedTab: number;
  setSelectedTab: (value: number) => void;
  getBestCallsAtEachPercentage: Map<number, { option: OptionQuote; profit: number }>;
  getBestPutsAtEachPercentage: Map<number, { option: OptionQuote; profit: number }>;
  selectedOptionForDetails: OptionQuote | null;
  setSelectedOptionForDetails: (option: OptionQuote | null) => void;
  showDetailsView: boolean;
  setShowDetailsView: (show: boolean) => void;
  investmentAmount: string;
  percentageIncrements: string;
}

export const LiveOptionsChain = (props: LiveOptionsChainProps) => {
  const hasData = createMemo(() => props.callsChain.length > 0 || props.putsChain.length > 0);

  // Get data freshness info
  const getDataFreshness = (options: OptionQuote[]) => {
    const dates = options.map(opt => opt.lastUpdated).filter(Boolean);
    if (dates.length === 0) return null;
    
    const timestamps = dates.map(d => new Date(d!).getTime());
    const mostRecent = new Date(Math.max(...timestamps));
    const hoursAgo = Math.floor((Date.now() - mostRecent.getTime()) / (1000 * 60 * 60));
    
    return { mostRecent, hoursAgo };
  };

  const currentFreshness = createMemo(() => {
    const callsFreshness = getDataFreshness(props.callsChain);
    const putsFreshness = getDataFreshness(props.putsChain);
    return props.selectedTab === 0 ? callsFreshness : putsFreshness;
  });

  const getFreshnessColor = (hoursAgo: number) => {
    if (hoursAgo <= 1) return '#4caf50';
    if (hoursAgo <= 24) return '#2196f3';
    return '#ff9800';
  };

  const getFreshnessText = (hoursAgo: number) => {
    if (hoursAgo <= 1) return 'Fresh data';
    if (hoursAgo <= 24) return 'Recent data';
    return 'Stale data';
  };

  // Convert OptionQuote to OptionData for OptionDetailsView
  const convertToOptionData = (option: OptionQuote | null) => {
    if (!option) return null;
    return {
      symbol: option.symbol,
      strike: option.strike,
      expiration: option.expiration,
      type: option.type as 'call' | 'put',
      bid: option.bid,
      ask: option.ask,
      volume: option.volume,
      openInterest: option.openInterest,
      impliedVolatility: option.impliedVolatility
    };
  };

  return (
    <Show when={hasData()}>
      <div style={{ 
        border: "1px solid #e0e0e0",
        "border-radius": "4px",
        "box-shadow": "0 1px 3px rgba(0,0,0,0.12)"
      }}>
        <div style={{ padding: "16px" }}>
          <Show 
            when={!props.showDetailsView}
            fallback={
              <OptionDetailsView
                option={convertToOptionData(props.selectedOptionForDetails)}
                onBack={() => props.setShowDetailsView(false)}
              />
            }
          >
            <h3 style={{ 
              margin: "0 0 16px 0",
              "font-size": "1.25rem",
              "font-weight": "500"
            }}>
              Options Chain
            </h3>
            
            {/* Data freshness indicator */}
            <Show when={currentFreshness()}>
              {(freshness) => (
                <div style={{ 
                  "background-color": getFreshnessColor(freshness().hoursAgo) + '20',
                  border: `1px solid ${getFreshnessColor(freshness().hoursAgo)}`,
                  "border-radius": "4px",
                  padding: "12px",
                  "margin-bottom": "16px"
                }}>
                  <p style={{ 
                    margin: "0",
                    "font-size": "0.875rem",
                    color: getFreshnessColor(freshness().hoursAgo)
                  }}>
                    {getFreshnessText(freshness().hoursAgo)} - Last updated: {freshness().mostRecent.toLocaleString()}
                  </p>
                </div>
              )}
            </Show>

            {/* Tabs */}
            <div style={{ 
              "border-bottom": "1px solid #e0e0e0",
              "margin-bottom": "16px"
            }}>
              <div style={{ display: "flex" }}>
                <button
                  onClick={() => props.setSelectedTab(0)}
                  style={{
                    background: props.selectedTab === 0 ? "#1976d2" : "transparent",
                    color: props.selectedTab === 0 ? "white" : "#1976d2",
                    border: "none",
                    padding: "12px 24px",
                    cursor: "pointer",
                    "border-bottom": props.selectedTab === 0 ? "2px solid #1976d2" : "2px solid transparent",
                    "font-size": "0.875rem",
                    "font-weight": "500"
                  }}
                >
                  CALLS ({props.callsChain.length})
                </button>
                <button
                  onClick={() => props.setSelectedTab(1)}
                  style={{
                    background: props.selectedTab === 1 ? "#1976d2" : "transparent",
                    color: props.selectedTab === 1 ? "white" : "#1976d2",
                    border: "none",
                    padding: "12px 24px",
                    cursor: "pointer",
                    "border-bottom": props.selectedTab === 1 ? "2px solid #1976d2" : "2px solid transparent",
                    "font-size": "0.875rem",
                    "font-weight": "500"
                  }}
                >
                  PUTS ({props.putsChain.length})
                </button>
              </div>
            </div>

            {/* Best Options Summary - using typed conversion for compatibility */}
            <Show when={props.selectedTab === 0 && props.getBestCallsAtEachPercentage.size > 0}>
              <div style={{ "margin-bottom": "16px" }}>
                <h4>Best Call Options Summary</h4>
                <p>Best options data available (component needs proper type mapping)</p>
              </div>
            </Show>
            <Show when={props.selectedTab === 1 && props.getBestPutsAtEachPercentage.size > 0}>
              <div style={{ "margin-bottom": "16px" }}>
                <h4>Best Put Options Summary</h4>
                <p>Best options data available (component needs proper type mapping)</p>
              </div>
            </Show>

            {/* Options Table */}
            <Show when={props.selectedTab === 0}>
              <OptionsGroupedByExpiration
                options={props.callsChain}
                stockQuote={props.stockQuote}
                onOptionClick={(option) => {
                  props.setSelectedOptionForDetails(option);
                  props.setShowDetailsView(true);
                }}
                bestAtPercentages={props.getBestCallsAtEachPercentage}
                optionType="call"
                investmentAmount={props.investmentAmount}
                percentageIncrements={props.percentageIncrements}
              />
            </Show>
            <Show when={props.selectedTab === 1}>
              <OptionsGroupedByExpiration
                options={props.putsChain}
                stockQuote={props.stockQuote}
                onOptionClick={(option) => {
                  props.setSelectedOptionForDetails(option);
                  props.setShowDetailsView(true);
                }}
                bestAtPercentages={props.getBestPutsAtEachPercentage}
                optionType="put"
                investmentAmount={props.investmentAmount}
                percentageIncrements={props.percentageIncrements}
              />
            </Show>

            {/* No data message */}
            <Show when={props.selectedTab === 0 && props.callsChain.length === 0}>
              <div style={{ 
                padding: "32px", 
                "text-align": "center",
                color: "#666"
              }}>
                <p>No call options available</p>
              </div>
            </Show>
            <Show when={props.selectedTab === 1 && props.putsChain.length === 0}>
              <div style={{ 
                padding: "32px", 
                "text-align": "center",
                color: "#666"
              }}>
                <p>No put options available</p>
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </Show>
  );
};
