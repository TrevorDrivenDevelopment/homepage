import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import App from './App';

test('renders resume text', () => {
  render(<App />);
  const linkElement = screen.getByText(/resume/i);
  expect(linkElement).toBeInTheDocument();
});
