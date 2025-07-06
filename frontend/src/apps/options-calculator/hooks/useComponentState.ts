import { useState } from 'react';
import { OptionQuote } from '../enhancedOptionsService';

export const useComponentState = () => {
  const [useManualData, setUseManualData] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [errorModalOpen, setErrorModalOpen] = useState<boolean>(false);
  const [investmentAmount, setInvestmentAmount] = useState<string>('10000');
  const [percentageIncrements, setPercentageIncrements] = useState<string>('5,10,15,20,25');
  const [selectedOptionForDetails, setSelectedOptionForDetails] = useState<OptionQuote | null>(null);
  const [showDetailsView, setShowDetailsView] = useState<boolean>(false);

  return {
    useManualData,
    setUseManualData,
    error,
    setError,
    errorModalOpen,
    setErrorModalOpen,
    investmentAmount,
    setInvestmentAmount,
    percentageIncrements,
    setPercentageIncrements,
    selectedOptionForDetails,
    setSelectedOptionForDetails,
    showDetailsView,
    setShowDetailsView,
  };
};
