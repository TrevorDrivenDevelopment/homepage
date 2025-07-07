import { Show } from 'solid-js';

interface OptionData {
  symbol: string;
  strike: number;
  expiration: string;
  type: 'call' | 'put';
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  impliedVolatility?: number;
}

interface OptionDetailsViewProps {
  option: OptionData | null;
  onBack: () => void;
}

export const OptionDetailsView = (props: OptionDetailsViewProps) => {
  return (
    <Show 
      when={props.option}
      fallback={
        <div style={{ 
          padding: "20px", 
          "text-align": "center",
          color: "#666"
        }}>
          <p>No option selected</p>
        </div>
      }
    >
      <div style={{ 
        padding: "20px", 
        border: "1px solid #ddd", 
        "border-radius": "8px",
        "margin-bottom": "16px",
        "background-color": "#fff"
      }}>
        <div style={{ 
          display: "flex", 
          "justify-content": "space-between", 
          "align-items": "center",
          "margin-bottom": "20px"
        }}>
          <h3 style={{ margin: "0", color: "#1976d2" }}>Option Details</h3>
          <button
            onClick={() => props.onBack()}
            style={{
              background: "#1976d2",
              color: "white",
              border: "none",
              padding: "8px 16px",
              "border-radius": "4px",
              cursor: "pointer",
              display: "flex",
              "align-items": "center",
              gap: "8px"
            }}
          >
            ← Back
          </button>
        </div>
        
        <div style={{ display: "grid", "grid-template-columns": "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div>
            <strong>Symbol:</strong> {props.option?.symbol}
          </div>
          <div>
            <strong>Strike:</strong> ${props.option?.strike}
          </div>
          <div>
            <strong>Expiration:</strong> {props.option?.expiration}
          </div>
          <div>
            <strong>Type:</strong> {props.option?.type?.toUpperCase()}
          </div>
          <div>
            <strong>Bid:</strong> ${props.option?.bid}
          </div>
          <div>
            <strong>Ask:</strong> ${props.option?.ask}
          </div>
          <div>
            <strong>Volume:</strong> {props.option?.volume}
          </div>
          <div>
            <strong>Open Interest:</strong> {props.option?.openInterest}
          </div>
          <Show when={props.option?.impliedVolatility}>
            <div>
              <strong>Implied Volatility:</strong> {(props.option?.impliedVolatility! * 100).toFixed(2)}%
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};
