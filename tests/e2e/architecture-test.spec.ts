import { expect, test } from '@playwright/test';
import type { ZylemGameElement } from '@zylem/game-lib/web-components';

test('the gallery loads the Architecture Test blueprint', async ({ page }) => {
	await page.goto('/demos/architecture-test');
	const game = page.locator('zylem-game[data-demo-id="architecture-test"]');

	await expect.poll(() => game.evaluate(element => {
		const stage = (element as ZylemGameElement).game?.getCurrentStage();
		return Boolean(stage?.getEntityByName('hello-text') && stage.getEntityByName('test-sprite'));
	})).toBe(true);
});
