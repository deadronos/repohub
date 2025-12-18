import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';

// A simple component to test
const Hello = ({ name }: { name: string }) => <div>Hello, {name}!</div>;

describe('Hello Component', () => {
  it('renders the name', () => {
    render(<Hello name="World" />);
    const element = screen.getByText('Hello, World!');
    expect(element).toBeInTheDocument();
  });
});
