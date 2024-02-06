import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CalendarTable from '../CalendarTable';
import '@testing-library/jest-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ year: '2021', month: '1' }),
}));

describe('CalendarTable', () => {
  test('renders without crashing', () => {
    render(
      <BrowserRouter>
        <CalendarTable />
      </BrowserRouter>
    );
    expect(screen.getByText(/January 2021/i)).toBeInTheDocument();
  }); 
 
});