import { test, expect } from '@playwright/test';

test.describe('AICAS Lite Full End-to-End Workflow', () => {
  test('should complete login, view dashboard, navigate to brands, wizard, approvals, calendar, and integrations', async ({ page }) => {
    // 1. Visit Login page
    await page.goto('/login');
    await expect(page.locator('h2')).toContainText('Welcome to AICAS Lite');

    // 2. Click Login button
    await page.click('button:has-text("Continue as Demo Marketing Manager")');
    await page.waitForURL('**/dashboard');

    // 3. Dashboard Verification
    await expect(page.locator('h1')).toContainText('Executive Content Dashboard');
    await expect(page.locator('text=Active Brand Profiles')).toBeVisible();

    // 4. Navigate to Brands page
    await page.click('a:has-text("Brand Profiles")');
    await page.waitForURL('**/brands');
    await expect(page.locator('h1')).toContainText('Brand Intelligence & Guidelines');
    await expect(page.locator('text=ApexAI Solutions')).toBeVisible();

    // 5. Navigate to Campaign Wizard
    await page.click('a:has-text("Campaign Wizard")');
    await page.waitForURL('**/campaigns');
    await expect(page.locator('h1')).toContainText('Campaign Operations');

    // 6. Navigate to Approval Queue
    await page.click('a:has-text("Approval Queue")');
    await page.waitForURL('**/approvals');
    await expect(page.locator('h1')).toContainText('Human Oversight & Approval Queue');

    // 7. Navigate to Calendar
    await page.click('a:has-text("Calendar & Schedule")');
    await page.waitForURL('**/calendar');
    await expect(page.locator('h1')).toContainText('Calendar & Schedule Orchestration');

    // 8. Navigate to Analytics
    await page.click('a:has-text("Analytics & Growth")');
    await page.waitForURL('**/analytics');
    await expect(page.locator('h1')).toContainText('Analytics & Optimization Dashboard');

    // 9. Navigate to Platform Integrations
    await page.click('a:has-text("Platform Integrations")');
    await page.waitForURL('**/settings/integrations');
    await expect(page.locator('h1')).toContainText('Platform API Connectors & Integrations');
    await expect(page.locator('text=LinkedIn Official API Connector')).toBeVisible();
    await expect(page.locator('text=Meta Graph API')).toBeVisible();
  });
});
