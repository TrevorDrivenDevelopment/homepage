import { For, Show } from 'solid-js';
import { Box, Typography, Chip } from '@suid/material';

interface OptionData {
  strike: number;
  // Add other option properties as needed
}

interface BestOptionsSummaryProps {
  bestAtPercentages: Map<number, { option: OptionData; profit: number }>;
  optionType: 'call' | 'put';
}

export const BestOptionsSummary = (props: BestOptionsSummaryProps) => {
  const entriesArray = () => Array.from(props.bestAtPercentages.entries()).sort(([a], [b]) => a - b);

  return (
    <Show when={props.bestAtPercentages.size > 0}>
      <Box
        sx={{
          backgroundColor: 'success.light',
          border: 1,
          borderColor: 'success.main',
          borderRadius: 1,
          p: 2,
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 1.5,
            color: 'success.dark',
            fontSize: '1rem',
            fontWeight: 600,
          }}
        >
          Best {props.optionType.toUpperCase()} Options by Price {props.optionType === 'call' ? 'Increase' : 'Decrease'}:
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <For each={entriesArray()}>
            {([percentage, { option, profit }]) => (
              <Chip
                label={`${props.optionType === 'call' ? '+' : '-'}${percentage}%: $${option.strike} Strike (${profit >= 0 ? '+' : ''}$${profit.toFixed(0)} profit)`}
                color="primary"
                size="small"
                sx={{
                  fontSize: '0.75rem',
                }}
              />
            )}
          </For>
        </Box>
      </Box>
    </Show>
  );
};
