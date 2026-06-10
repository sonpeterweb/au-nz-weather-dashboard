import { type Page, expect, test } from '@playwright/test';

import {
  dailyWeatherResponse,
  hourlyWeatherResponse,
} from './fixtures/weather';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getUpcomingDateRange(): { start: string; end: string } {
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + 7);

  return { start: formatDate(start), end: formatDate(end) };
}

async function mockWeatherApi(page: Page) {
  await page.route('**/api/weather**', async (route) => {
    const url = new URL(route.request().url());
    const gran = url.searchParams.get('gran') ?? 'hourly';
    const body =
      gran === 'daily' ? dailyWeatherResponse : hourlyWeatherResponse;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}

test.describe('Weather Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockWeatherApi(page);
  });

  test('loads the dashboard page successfully', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(
      page.getByRole('heading', { name: 'Weather Dashboard' })
    ).toBeVisible();
    await expect(page.getByLabel('Dashboard controls')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Manager View' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Auckland, NZ' })
    ).toBeVisible();
  });

  test('role toggle switches between Manager and Analyst views', async ({
    page,
  }) => {
    await page.goto('/dashboard?role=manager');

    await expect(
      page.getByRole('heading', { name: 'Manager View' })
    ).toBeVisible();
    await expect(page.getByText('Avg temp')).toBeVisible();

    await page.getByRole('button', { name: 'Analyst' }).click();
    await expect(page).toHaveURL(/role=analyst/);
    await expect(
      page.getByRole('heading', { name: 'Analyst View' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Temperature' })
    ).toBeVisible();
  });

  test('filters update dashboard content and URL', async ({ page }) => {
    await page.goto('/dashboard?role=analyst');

    await page.getByLabel('Sydney, AU').click();
    await expect(page).toHaveURL(/city=.*sydney/);

    await page.getByLabel('Data granularity').selectOption('daily');
    await expect(page).toHaveURL(/gran=daily/);
    await expect(page.getByText('Precipitation')).toBeVisible();
  });

  test('URL parameters restore dashboard state', async ({ page }) => {
    await page.goto(
      '/dashboard?role=analyst&city=auckland,sydney&gran=hourly&vars=temperature_2m,precipitation'
    );

    await expect(page.getByRole('button', { name: 'Analyst' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(
      page.getByRole('checkbox', { name: 'Auckland, NZ' })
    ).toBeChecked();
    await expect(
      page.getByRole('checkbox', { name: 'Sydney, AU' })
    ).toBeChecked();
    await expect(page.getByLabel('Data granularity')).toHaveValue('hourly');
    await expect(
      page.getByRole('heading', { name: 'Analyst View' })
    ).toBeVisible();
  });

  test('theme toggle switches themes and persists after reload', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    await page.getByLabel('Select theme').selectOption('dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.getByLabel('Select theme').selectOption('cupcake');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'cupcake');
  });

  test('multiple city selection shows comparison content', async ({ page }) => {
    await page.goto('/dashboard?role=manager&city=auckland,sydney');

    await expect(
      page.getByRole('columnheader', { name: 'City' })
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Auckland, NZ' })
    ).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Sydney, AU' })).toBeVisible();
  });

  test('date range filtering restores values from URL parameters', async ({
    page,
  }) => {
    const { start, end } = getUpcomingDateRange();
    await page.goto(`/dashboard?start=${start}&end=${end}`);

    await expect(page.getByLabel('Start date')).toHaveValue(start);
    await expect(page.getByLabel('End date')).toHaveValue(end);
    await expect(
      page.getByRole('heading', { name: 'Manager View' })
    ).toBeVisible();
  });

  test('shows error messages for invalid city selections', async ({ page }) => {
    await page.goto('/dashboard?city=invalid-city');

    await expect(page.getByText('Unknown cities')).toBeVisible();
    await expect(page.getByText(/invalid-city/)).toBeVisible();
    await expect(page.getByText('No valid cities selected')).toBeVisible();
  });

  test('shows page-level date range error from URL parameters', async ({
    page,
  }) => {
    const { start } = getUpcomingDateRange();
    const invalidEnd = new Date();
    invalidEnd.setDate(invalidEnd.getDate() + 45);

    await page.goto(`/dashboard?start=${start}&end=${formatDate(invalidEnd)}`);

    await expect(page.getByText('Date range error')).toBeVisible();
    await expect(page.getByText(/exceeds maximum of 30 days/i)).toBeVisible();
  });

  test('supports keyboard navigation for role toggle', async ({ page }) => {
    await page.goto('/dashboard?role=manager');

    await page.getByRole('button', { name: 'Analyst' }).focus();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/role=analyst/);
    await expect(
      page.getByRole('heading', { name: 'Analyst View' })
    ).toBeVisible();
  });
});

test.describe('Weather Dashboard mobile', () => {
  test('renders controls on mobile viewport', async ({ page }) => {
    await mockWeatherApi(page);
    await page.goto('/dashboard');

    await expect(page.getByLabel('Dashboard controls')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Manager View' })
    ).toBeVisible();
  });
});
