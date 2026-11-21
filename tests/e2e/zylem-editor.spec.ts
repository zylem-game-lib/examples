import { test, expect } from '@playwright/test';

test.describe('<zylem-editor> web component', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name.includes('Mobile'),
      'Desktop launcher coverage only',
    );

    await page.goto('/');
  });

  test('renders the zylem-editor element', async ({ page }) => {
    // The zylem-editor web component should be present in the DOM
    const editor = page.locator('zylem-editor');
    await expect(editor).toBeAttached();
  });

  test('renders the editor toggle button', async ({ page }) => {
    // The toggle button lives inside the shadow DOM of zylem-editor
    const editor = page.locator('zylem-editor');
    const toggleButton = editor.locator('#zylem-editor-toggle');
    
    await expect(toggleButton).toBeVisible();
    await expect(toggleButton).toHaveAttribute('type', 'button');
  });

  test('opens the toolbar when the editor launcher is clicked', async ({ page }) => {
    const editor = page.locator('zylem-editor');
    const toggleButton = editor.locator('#zylem-editor-toggle');
    
    await toggleButton.click();
    await expect(editor.getByRole('toolbar')).toBeVisible();
  });

  test('closes the toolbar when the editor launcher is clicked again', async ({ page }) => {
    const editor = page.locator('zylem-editor');
    const toggleButton = editor.locator('#zylem-editor-toggle');

    await toggleButton.click();

    const toolbar = editor.getByRole('toolbar');
    await expect(toolbar).toBeVisible();
    await toggleButton.click();
    await expect(toolbar).toBeHidden();
  });
});
