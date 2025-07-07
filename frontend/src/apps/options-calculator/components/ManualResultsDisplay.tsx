import { For, Show, createMemo } from 'solid-js';

interface OptionResult {
  strike: number;
  bid: number;
  ask: number;
  price?: number;
  gainLoss: number;
  actualInvestment: number;
  shares: number;
  contracts: number;
  percentageGainLoss: number;
}

interface ManualResultsDisplayProps {
  manualResults: Map<number, OptionResult[]>;
  bestManualOptions: {
    best?: OptionResult;
    secondBest?: OptionResult;
  };
  getBestManualOptionsAtEachPercentage: Map<number, { option: OptionResult; profit: number }>;
  calculatePerformanceForOption: (option: OptionResult) => Array<{
    percentage: string;
    sellPrice: string;
    gainLoss: string;
    percentageGainLoss: string;
    isProfit: boolean;
  }>;
}

export const ManualResultsDisplay = (props: ManualResultsDisplayProps) => {
  const hasResults = () => props.manualResults.size > 0;

  const sortedSellPrices = createMemo(() => {
    const prices = Array.from(props.manualResults.keys());
    return prices.sort((a, b) => a - b);
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div style={{ 
      "margin-top": "24px",
      border: "1px solid #4A6E8D",
      "border-radius": "4px",
      "box-shadow": "0 1px 3px rgba(0,0,0,0.12)",
      "background-color": "#4A6E8D"
    }}>
      <div style={{ padding: "16px" }}>
        <h3 style={{ 
          margin: "0 0 16px 0",
          "font-size": "1.25rem",
          "font-weight": "500",
          color: "#ffffff"
        }}>
          Manual Options Results
        </h3>
        
        <Show when={!hasResults()}>
          <div style={{ 
            "background-color": "#1B3A57",
            border: "1px solid #4A6E8D",
            "border-radius": "4px",
            padding: "16px",
            "text-align": "center",
            color: "#7CE2FF"
          }}>
            <p style={{ margin: "0" }}>
              No results to display. Please enter option data and click "Calculate Options" to see results.
            </p>
          </div>
        </Show>

        <Show when={hasResults()}>
          {/* Best Options Summary */}
          <Show when={props.bestManualOptions.best}>
            <div style={{ 
              "background-color": "#1B3A57",
              border: "1px solid #7CE2FF",
              "border-radius": "4px",
              padding: "16px",
              "margin-bottom": "16px"
            }}>
              <h4 style={{ 
                margin: "0 0 8px 0",
                "font-size": "1.1rem",
                color: "#7CE2FF"
              }}>
                Best Options Summary
              </h4>
              <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "16px", color: "#ffffff" }}>
                <Show when={props.bestManualOptions.best}>
                  <div>
                    <strong>Best Option:</strong>
                    <div style={{ "margin-top": "4px" }}>
                      Strike: {formatCurrency(props.bestManualOptions.best!.strike)}<br/>
                      Gain/Loss: {formatCurrency(props.bestManualOptions.best!.gainLoss)}<br/>
                      Return: {formatPercentage(props.bestManualOptions.best!.percentageGainLoss)}
                    </div>
                  </div>
                </Show>
                <Show when={props.bestManualOptions.secondBest}>
                  <div>
                    <strong>Second Best Option:</strong>
                    <div style={{ "margin-top": "4px" }}>
                      Strike: {formatCurrency(props.bestManualOptions.secondBest!.strike)}<br/>
                      Gain/Loss: {formatCurrency(props.bestManualOptions.secondBest!.gainLoss)}<br/>
                      Return: {formatPercentage(props.bestManualOptions.secondBest!.percentageGainLoss)}
                    </div>
                  </div>
                </Show>
              </div>
            </div>
          </Show>

          {/* Results by Sell Price */}
          <div style={{ "margin-bottom": "24px" }}>
            <h4 style={{ 
              margin: "0 0 16px 0",
              "font-size": "1.1rem",
              color: "#ffffff"
            }}>
              Results by Target Sell Price
            </h4>
            
            <For each={sortedSellPrices()}>
              {(sellPrice) => {
                const results = props.manualResults.get(sellPrice) || [];
                return (
                  <div style={{ 
                    border: "1px solid #4A6E8D",
                    "border-radius": "4px",
                    "margin-bottom": "16px",
                    overflow: "hidden",
                    "background-color": "#1B3A57"
                  }}>
                    <div style={{ 
                      "background-color": "#4A6E8D",
                      padding: "12px 16px",
                      "border-bottom": "1px solid #1B3A57"
                    }}>
                      <strong style={{ color: "#ffffff" }}>Target Price: {formatCurrency(sellPrice)}</strong>
                    </div>
                    <div style={{ overflow: "auto" }}>
                      <table style={{ 
                        width: "100%",
                        "border-collapse": "collapse",
                        "font-size": "0.875rem",
                        "background-color": "#1B3A57"
                      }}>
                        <thead>
                          <tr style={{ "background-color": "#4A6E8D" }}>
                            <th style={{ 
                              padding: "8px 12px",
                              "text-align": "left",
                              "border-bottom": "1px solid #1B3A57",
                              color: "#ffffff"
                            }}>Strike</th>
                            <th style={{ 
                              padding: "8px 12px",
                              "text-align": "right",
                              "border-bottom": "1px solid #1B3A57",
                              color: "#ffffff"
                            }}>Contracts</th>
                            <th style={{ 
                              padding: "8px 12px",
                              "text-align": "right",
                              "border-bottom": "1px solid #1B3A57",
                              color: "#ffffff"
                            }}>Investment</th>
                            <th style={{ 
                              padding: "8px 12px",
                              "text-align": "right",
                              "border-bottom": "1px solid #1B3A57",
                              color: "#ffffff"
                            }}>Gain/Loss</th>
                            <th style={{ 
                              padding: "8px 12px",
                              "text-align": "right",
                              "border-bottom": "1px solid #1B3A57",
                              color: "#ffffff"
                            }}>Return %</th>
                          </tr>
                        </thead>
                        <tbody>
                          <For each={results}>
                            {(result, index) => (
                              <tr style={{ 
                                "background-color": index() === 0 ? "#4A6E8D" : "#1B3A57"
                              }}>
                                <td style={{ 
                                  padding: "8px 12px",
                                  "border-bottom": "1px solid #4A6E8D",
                                  color: "#ffffff"
                                }}>
                                  {formatCurrency(result.strike)}
                                  {index() === 0 && (
                                    <span style={{ 
                                      "margin-left": "8px",
                                      "background-color": "#7CE2FF",
                                      color: "#1B3A57",
                                      padding: "2px 6px",
                                      "border-radius": "4px",
                                      "font-size": "0.75rem",
                                      "font-weight": "bold"
                                    }}>
                                      BEST
                                    </span>
                                  )}
                                </td>
                                <td style={{ 
                                  padding: "8px 12px",
                                  "text-align": "right",
                                  "border-bottom": "1px solid #4A6E8D",
                                  color: "#ffffff"
                                }}>
                                  {result.contracts}
                                </td>
                                <td style={{ 
                                  padding: "8px 12px",
                                  "text-align": "right",
                                  "border-bottom": "1px solid #4A6E8D",
                                  color: "#ffffff"
                                }}>
                                  {formatCurrency(result.actualInvestment)}
                                </td>
                                <td style={{ 
                                  padding: "8px 12px",
                                  "text-align": "right",
                                  "border-bottom": "1px solid #4A6E8D",
                                  color: result.gainLoss >= 0 ? "#7CE2FF" : "#ff6b6b",
                                  "font-weight": result.gainLoss >= 0 ? "500" : "normal"
                                }}>
                                  {formatCurrency(result.gainLoss)}
                                </td>
                                <td style={{ 
                                  padding: "8px 12px",
                                  "text-align": "right",
                                  "border-bottom": "1px solid #4A6E8D",
                                  color: result.percentageGainLoss >= 0 ? "#7CE2FF" : "#ff6b6b",
                                  "font-weight": result.percentageGainLoss >= 0 ? "500" : "normal"
                                }}>
                                  {formatPercentage(result.percentageGainLoss)}
                                </td>
                              </tr>
                            )}
                          </For>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>

          {/* Performance Analysis for Best Option */}
          <Show when={props.bestManualOptions.best}>
            <div style={{ 
              "margin-top": "24px",
              border: "1px solid #4A6E8D",
              "border-radius": "4px",
              "background-color": "#1B3A57"
            }}>
              <div style={{ 
                "background-color": "#4A6E8D",
                padding: "12px 16px",
                "border-bottom": "1px solid #1B3A57"
              }}>
                <strong style={{ color: "#ffffff" }}>Performance Analysis - Best Option (Strike: {formatCurrency(props.bestManualOptions.best!.strike)})</strong>
              </div>
              <div style={{ overflow: "auto" }}>
                <table style={{ 
                  width: "100%",
                  "border-collapse": "collapse",
                  "font-size": "0.875rem",
                  "background-color": "#1B3A57"
                }}>
                  <thead>
                    <tr style={{ "background-color": "#4A6E8D" }}>
                      <th style={{ 
                        padding: "8px 12px",
                        "text-align": "left",
                        "border-bottom": "1px solid #1B3A57",
                        color: "#ffffff"
                      }}>Price Change</th>
                      <th style={{ 
                        padding: "8px 12px",
                        "text-align": "right",
                        "border-bottom": "1px solid #1B3A57",
                        color: "#ffffff"
                      }}>Sell Price</th>
                      <th style={{ 
                        padding: "8px 12px",
                        "text-align": "right",
                        "border-bottom": "1px solid #1B3A57",
                        color: "#ffffff"
                      }}>Gain/Loss</th>
                      <th style={{ 
                        padding: "8px 12px",
                        "text-align": "right",
                        "border-bottom": "1px solid #1B3A57",
                        color: "#ffffff"
                      }}>Return %</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={props.calculatePerformanceForOption(props.bestManualOptions.best!)}>
                      {(performance) => (
                        <tr>
                          <td style={{ 
                            padding: "8px 12px",
                            "border-bottom": "1px solid #4A6E8D",
                            color: "#ffffff"
                          }}>
                            +{performance.percentage}
                          </td>
                          <td style={{ 
                            padding: "8px 12px",
                            "text-align": "right",
                            "border-bottom": "1px solid #4A6E8D",
                            color: "#ffffff"
                          }}>
                            {performance.sellPrice}
                          </td>
                          <td style={{ 
                            padding: "8px 12px",
                            "text-align": "right",
                            "border-bottom": "1px solid #4A6E8D",
                            color: performance.isProfit ? "#7CE2FF" : "#ff6b6b",
                            "font-weight": performance.isProfit ? "500" : "normal"
                          }}>
                            {performance.gainLoss}
                          </td>
                          <td style={{ 
                            padding: "8px 12px",
                            "text-align": "right",
                            "border-bottom": "1px solid #4A6E8D",
                            color: performance.isProfit ? "#7CE2FF" : "#ff6b6b",
                            "font-weight": performance.isProfit ? "500" : "normal"
                          }}>
                            {performance.percentageGainLoss}
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
};
