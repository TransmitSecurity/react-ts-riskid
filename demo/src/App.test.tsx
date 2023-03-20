import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from './App';

const mockedTransmit = jest.fn();
jest.mock('@transmit-security/riskid-reactjs-ts', () => ({
    ...jest.requireActual('@transmit-security/riskid-reactjs-ts'),
    useTSAccountProtection: () => ({
        triggerActionEvent: mockedTransmit,
    }),
}));

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText("ReactJS AccountProtection Demo");
  expect(linkElement).toBeInTheDocument();
});
