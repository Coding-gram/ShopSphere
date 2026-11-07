import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from './Pagination';
import type { Pagination as PaginationType } from '@/types';

function makePagination(overrides: Partial<PaginationType> = {}): PaginationType {
  return {
    page: 1,
    limit: 12,
    total: 50,
    totalPages: 5,
    hasMore: true,
    ...overrides,
  };
}

describe('Pagination', () => {
  it('renders page buttons', () => {
    const onPageChange = vi.fn();
    render(<Pagination pagination={makePagination()} onPageChange={onPageChange} />);

    expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 5')).toBeInTheDocument();
  });

  it('highlights current page', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination pagination={makePagination({ page: 3 })} onPageChange={onPageChange} />
    );

    const currentPage = screen.getByLabelText('Page 3');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });

  it('disables previous button on first page', () => {
    const onPageChange = vi.fn();
    render(<Pagination pagination={makePagination()} onPageChange={onPageChange} />);

    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });

  it('disables next button on last page', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        pagination={makePagination({ page: 5, hasMore: false })}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });

  it('calls onPageChange when clicking a page', () => {
    const onPageChange = vi.fn();
    render(<Pagination pagination={makePagination()} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByLabelText('Page 3'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange when clicking next', () => {
    const onPageChange = vi.fn();
    render(<Pagination pagination={makePagination()} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByLabelText('Next page'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('renders nothing when totalPages is 1', () => {
    const onPageChange = vi.fn();
    const { container } = render(
      <Pagination
        pagination={makePagination({ totalPages: 1, hasMore: false })}
        onPageChange={onPageChange}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('shows ellipsis for many pages', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        pagination={makePagination({ page: 5, totalPages: 20, total: 240 })}
        onPageChange={onPageChange}
      />
    );

    // Should have at least one ellipsis character
    const ellipses = screen.getAllByText('…');
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });
});

