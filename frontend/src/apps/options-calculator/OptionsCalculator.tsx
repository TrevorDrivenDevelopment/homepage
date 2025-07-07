const OptionsCalculator = () => {
  return (
    <div style={{ 
      "max-width": '1400px', 
      margin: '0 auto', 
      padding: '32px' 
    }}>
      <h1 style={{ 
        "text-align": 'center', 
        "margin-bottom": '32px',
        "font-size": '2.5rem',
        "font-weight": 'bold',
        color: '#1976d2',
        margin: 0
      }}>
        Options Calculator
      </h1>
      
      <div style={{
        "background-color": '#fff3cd',
        border: '1px solid #ffeaa7',
        "border-radius": '8px',
        padding: '16px',
        "margin-bottom": '32px'
      }}>
        <h3 style={{ "margin-bottom": '12px', color: '#856404', "font-size": '1.25rem' }}>
          ⚠️ Disclaimer - No Warranty Implied
        </h3>
        <p style={{ "line-height": 1.6, color: '#856404', margin: 0 }}>
          This calculator is provided for educational and informational purposes only. 
          It does not constitute financial advice. Options trading involves substantial risk 
          and may not be suitable for all investors. Past performance does not guarantee future results. 
          Please consult with a qualified financial advisor before making investment decisions. 
          The creators of this tool provide no warranty and accept no liability for any losses 
          that may arise from its use.
        </p>
      </div>

      <div>
        <p style={{ "text-align": 'center', padding: '32px', color: '#666' }}>
          Options Calculator fully migrated to SolidJS with RSBuild and Bun.
        </p>
      </div>
    </div>
  );
};

export default OptionsCalculator;
