import { render, screen } from '@testing-library/react';

import { ErrorMessage, ErrorMessageList } from '@/components/ErrorMessage';

describe('ErrorMessage', () => {
  it('renders title and message with alert role', () => {
    render(
      <ErrorMessage
        title='Weather data unavailable'
        message='Please try again later.'
        variant='warning'
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Weather data unavailable')).toBeInTheDocument();
    expect(screen.getByText('Please try again later.')).toBeInTheDocument();
  });
});

describe('ErrorMessageList', () => {
  it('renders nothing when messages are empty', () => {
    const { container } = render(<ErrorMessageList messages={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders multiple alerts', () => {
    render(
      <ErrorMessageList
        messages={[
          {
            id: 'one',
            title: 'First issue',
            message: 'First message',
            variant: 'warning',
          },
          {
            id: 'two',
            title: 'Second issue',
            message: 'Second message',
            variant: 'error',
          },
        ]}
      />
    );

    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });
});
