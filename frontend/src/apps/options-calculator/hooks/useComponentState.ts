import { createSignal } from 'solid-js';
import { OptionQuote } from '../enhancedOptionsService';

export const useComponentState = () => {
  const [useManualData, setUseManualData] = createSignal<boolean>(false);
  const [error, setError] = createSignal<string>('');
  const [errorModalOpen, setErrorModalOpen] = createSignal<boolean>(false);
  const [investmentAmount, setInvestmentAmount] = createSignal<string>('10000');
  const [percentageIncrements, setPercentageIncrements] = createSignal<string>('5,10,15,20,25');
  const [selectedOptionForDetails, setSelectedOptionForDetails] = createSignal<OptionQuote | null>(null);
  const [showDetailsView, setShowDetailsView] = createSignal<boolean>(false);

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
