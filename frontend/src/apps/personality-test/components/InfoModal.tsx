import { Show } from 'solid-js';
import { MBTI_STYLES } from '../theme/mbtiTheme';

interface InfoModalProps {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
}

const InfoModal = (props: InfoModalProps) => {
  return (
    <Show when={props.open}>
      <div style={{
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        "background-color": "rgba(0, 0, 0, 0.5)",
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        "z-index": "1300"
      }}>
        <div style={{
          ...MBTI_STYLES.modalPaper,
          "max-width": "600px",
          width: "100%",
          margin: "32px",
          "max-height": "calc(100% - 64px)",
          overflow: "auto"
        }}>
          <div style={{ 
            display: "flex", 
            "justify-content": "space-between", 
            "align-items": "center",
            "padding-bottom": "8px",
            ...MBTI_STYLES.modalDivider
          }}>
            <h2 style={{ 
              margin: "0",
              "font-size": "1.25rem",
              "font-weight": "bold" 
            }}>
              {props.title}
            </h2>
            <button
              onClick={() => props.onClose()}
              style={{
                ...MBTI_STYLES.iconButton,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                "border-radius": "50%",
                display: "flex",
                "align-items": "center",
                "justify-content": "center"
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          
          <div style={{ "padding-top": "16px" }}>
            <p style={{ 
              margin: "0",
              "font-size": "1rem",
              "line-height": "1.6" 
            }}>
              {props.description}
            </p>
          </div>
          
          <div style={{ 
            padding: "16px", 
            "padding-top": "8px",
            display: "flex",
            "justify-content": "flex-end"
          }}>
            <button 
              onClick={() => props.onClose()}
              style={{
                ...MBTI_STYLES.primaryButton,
                border: "none",
                padding: "8px 22px",
                "border-radius": "4px",
                cursor: "pointer",
                "font-size": "0.875rem",
                "font-weight": "500",
                "text-transform": "uppercase",
                "letter-spacing": "0.02857em"
              }}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default InfoModal;
