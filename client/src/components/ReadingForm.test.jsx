import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ReadingForm from './ReadingForm';

describe('ReadingForm', () => {
  it('shows a clear validation message when the value is empty', () => {
    render(<ReadingForm onSubmit={vi.fn()} onClose={vi.fn()} saving={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save reading' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a glucose value.');
  });
  it('submits a valid reading with a numeric value', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ReadingForm onSubmit={onSubmit} onClose={vi.fn()} saving={false} />);
    fireEvent.change(screen.getByPlaceholderText('e.g. 110'), { target: { value: '115' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save reading' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: 115 }));
  });
});
