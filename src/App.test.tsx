import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect'; // Updated import to include extend-expect
import App from './App';
import { describe, it, expect } from "@jest/globals";

describe('App', () => {
  it('renders learn react link', () => {
    render(<App />);
    const linkElement = screen.getByText(/resume/i);
    expect(linkElement).toBeDefined();
  });
});


