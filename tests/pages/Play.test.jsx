import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Play from '../../src/pages/Play';

describe('Play', () => {
  it('renders the crossword grid and action buttons', () => {
    render(
      <MemoryRouter>
        <Play />
      </MemoryRouter>
    );
    expect(screen.getByText('Check')).toBeInTheDocument();
    expect(screen.getByText('Learn')).toBeInTheDocument();
    expect(screen.getByText(/Show Clues/)).toBeInTheDocument();
  });
});
