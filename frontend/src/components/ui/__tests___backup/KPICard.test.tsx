import { render, screen } from '@testing-library/react';
import { KPICard } from '../KPICard';
import { Users } from 'lucide-react';
import { vi } from 'vitest';

describe('KPICard Component', () => {
  it('renders title and value correctly', () => {
    const kpi = {
      id: 'kpi-1',
      title: 'Total Fans',
      value: '50,000',
      icon: Users
    };
    render(<KPICard kpi={kpi as any} index={0} />);
    expect(screen.getByText('Total Fans')).toBeInTheDocument();
    expect(screen.getByText('50,000')).toBeInTheDocument();
  });

  it('renders trend if provided', () => {
    const kpi = {
      id: 'kpi-2',
      title: 'Revenue',
      value: '10k',
      icon: Users,
      trend: { value: 5, label: 'vs last match' }
    };
    render(<KPICard kpi={kpi as any} index={0} />);
    expect(screen.getByText('vs last match')).toBeInTheDocument();
    expect(screen.getByText('5%')).toBeInTheDocument();
  });
});
