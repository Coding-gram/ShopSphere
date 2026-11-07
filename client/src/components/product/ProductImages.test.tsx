import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductImages } from './ProductImages';

describe('ProductImages', () => {
  it('renders editorial placeholder when no images provided', () => {
    render(<ProductImages images={[]} productName="Merino Wool Overcoat" />);
    expect(screen.getByText('MW')).toBeInTheDocument();
  });

  it('renders single image without thumbnails or arrows', () => {
    render(
      <ProductImages
        images={['https://example.com/img.jpg']}
        productName="Test Product"
      />
    );
    expect(screen.getByAltText('Test Product — image 1 of 1')).toBeInTheDocument();
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });

  it('renders multiple images with thumbnails and arrows', () => {
    render(
      <ProductImages
        images={['https://example.com/1.jpg', 'https://example.com/2.jpg', 'https://example.com/3.jpg']}
        productName="Test Product"
      />
    );
    expect(screen.getByLabelText('Previous image')).toBeInTheDocument();
    expect(screen.getByLabelText('Next image')).toBeInTheDocument();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('navigates between images with arrows', () => {
    render(
      <ProductImages
        images={['https://example.com/1.jpg', 'https://example.com/2.jpg']}
        productName="Test Product"
      />
    );
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Next image'));
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });

  it('navigates between images with thumbnail clicks', () => {
    render(
      <ProductImages
        images={['https://example.com/1.jpg', 'https://example.com/2.jpg']}
        productName="Test Product"
      />
    );
    fireEvent.click(screen.getByLabelText('View image 2'));
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });

  it('disables prev arrow on first image and next arrow on last', () => {
    render(
      <ProductImages
        images={['https://example.com/1.jpg', 'https://example.com/2.jpg']}
        productName="Test Product"
      />
    );
    expect(screen.getByLabelText('Previous image')).toBeDisabled();
    expect(screen.getByLabelText('Next image')).not.toBeDisabled();

    fireEvent.click(screen.getByLabelText('Next image'));
    expect(screen.getByLabelText('Previous image')).not.toBeDisabled();
    expect(screen.getByLabelText('Next image')).toBeDisabled();
  });
});

