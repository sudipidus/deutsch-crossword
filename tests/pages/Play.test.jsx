import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Play from '../../src/pages/Play';

describe('Play', () => {
  it('renders the crossword grid and clue list', () => {
    render(
      <MemoryRouter>
        <Play />
      </MemoryRouter>
    );
    expect(screen.getByText('Across')).toBeInTheDocument();
    expect(screen.getByText('Down')).toBeInTheDocument();
    expect(screen.getByText('Check')).toBeInTheDocument();
  });
});
