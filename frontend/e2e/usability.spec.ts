import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

async function assertChartsFit(page: Page) {
   await expect(page.locator('.chart-frame').first().locator('svg.recharts-surface')).toBeVisible();
   for (const frame of await page.locator('.chart-frame').all()) {
      await expect.poll(() => frame.locator('.recharts-area-curve, .recharts-bar-rectangle path').evaluateAll(paths => paths.some(path => { const box = path.getBoundingClientRect(); return box.width > 2 && box.height > 2; }))).toBe(true);
   }
   const issues = await page.locator('.chart-frame').evaluateAll(frames => frames.flatMap((frame, index) => {
      const bounds = frame.getBoundingClientRect();
      const issues: string[] = [];
      if (bounds.width <= 0 || bounds.height < 200 || bounds.right > window.innerWidth + 1) issues.push(`Chart ${index} dimensions`);
      const svg = frame.querySelector('svg.recharts-surface')?.getBoundingClientRect();
      if (!svg || svg.width > bounds.width + 1 || svg.height > bounds.height + 1) issues.push(`Chart ${index} SVG exceeds frame`);
      frame.querySelectorAll('svg.recharts-surface text').forEach(text => {
         const box = text.getBoundingClientRect();
         if (box.width && (box.left < bounds.left - 1 || box.right > bounds.right + 1 || box.top < bounds.top - 1 || box.bottom > bounds.bottom + 1)) issues.push(`Chart ${index} clipped label: ${text.textContent}`);
      });
      frame.querySelectorAll('.recharts-area-curve, .recharts-bar-rectangle path').forEach(path => {
         const box = path.getBoundingClientRect();
         if (box.width && (box.left < bounds.left - 1 || box.right > bounds.right + 1 || box.top < bounds.top - 1 || box.bottom > bounds.bottom + 1)) issues.push(`Chart ${index} plotted data exceeds frame`);
      });
      return issues;
   }));
   expect(issues).toEqual([]);
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test('dashboard and weight charts fit; touches do not select the whole chart', async ({ page }, info) => {
   for (const path of ['/dashboard', '/body-weight']) {
      await page.goto(path);
      await assertChartsFit(page);
      const surface = page.locator('.chart-frame svg.recharts-surface').first();
      await surface.scrollIntoViewIfNeeded();
      if (info.project.use.hasTouch) await surface.tap({ position: { x: 120, y: 70 } });
      else await surface.click({ position: { x: 120, y: 70 } });
      await surface.dblclick({ position: { x: 120, y: 70 } });
      expect(await page.evaluate(() => window.getSelection()?.toString() || '')).toBe('');
      expect(await surface.evaluate(element => getComputedStyle(element).userSelect)).toBe('none');
      await surface.focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('.chart-frame').first().locator('.recharts-tooltip-wrapper')).toBeVisible();
      await page.getByRole('heading', { level: 1 }).click();
      await assertChartsFit(page);
      await page.screenshot({ path: `test-results/review-${info.project.name}-${path.slice(1)}.png`, fullPage: true });
   }
});

test('workout library search, quick start, history filters and progression work', async ({ page }, info) => {
   await page.goto('/workouts');
   await expect(page.getByText('Seu próximo treino começa aqui')).toBeVisible();
   await page.getByRole('textbox', { name: 'Buscar fichas' }).fill('pernas');
   await expect(page.getByRole('button', { name: 'Treinar agora' })).toHaveCount(1);
   await page.getByRole('textbox', { name: 'Buscar fichas' }).fill('');
   await page.screenshot({ path: `test-results/review-${info.project.name}-workouts.png`, fullPage: true });
   await page.getByRole('button', { name: 'Treinar agora' }).first().click();
   await expect(page).toHaveURL(/\/logs\?workout=new-workout/);
   await expect(page.getByRole('button', { name: 'Registrar série', exact: true })).toBeVisible();
   await page.goto('/logs');
   await page.getByRole('button', { name: 'Concluídos', exact: true }).click();
   await expect(page.getByText('Completo', { exact: true })).toHaveCount(2);
   await page.screenshot({ path: `test-results/review-${info.project.name}-logs.png`, fullPage: true });
   await page.locator('button[aria-expanded="false"]').first().click();
   await page.getByRole('button', { name: 'Remada curvada com barra', exact: true }).click();
   await expect(page.getByRole('dialog')).toBeVisible();
   await assertChartsFit(page);
   await page.screenshot({ path: `test-results/review-${info.project.name}-progression.png`, fullPage: true });
});

test('profile password change validates confirmation, reports errors and signs out after success', async ({ page }, info) => {
   await page.goto('/profile');
   await expect(page.getByRole('button', { name: /Alterar senha/ })).toBeVisible();
   await page.screenshot({ path: `test-results/review-${info.project.name}-profile.png`, fullPage: true });
   await page.getByRole('button', { name: /Alterar senha/ }).click();
   await page.getByLabel('Senha atual', { exact: true }).fill('wrong-password');
   await page.getByLabel('Nova senha', { exact: true }).fill('test-new-password');
   await page.getByLabel('Confirmar nova senha', { exact: true }).fill('different-password');
   await page.getByRole('button', { name: 'Alterar senha', exact: true }).click();
   await expect(page.getByRole('alert')).toHaveText('A confirmação não corresponde à nova senha.');
   await page.getByLabel('Confirmar nova senha', { exact: true }).fill('test-new-password');
   await page.getByRole('button', { name: 'Alterar senha', exact: true }).click();
   await expect(page.getByRole('alert')).toHaveText('Senha atual incorreta.');
   await page.getByLabel('Senha atual', { exact: true }).fill('test-current-password');
   await page.getByRole('button', { name: 'Alterar senha', exact: true }).click();
   await expect(page).toHaveURL(/\/login$/);
});

test('body map selects visible chest and back triangles and ignores neutral areas and rotation gestures', async ({ page }, info) => {
   await page.goto('/dashboard');
   await expect(page.getByRole('button', { name: 'Costas', exact: true })).toBeEnabled();
   const canvas = page.getByRole('group', { name: 'Modelo corporal 3D rotacionável' }).locator('canvas');
   await canvas.scrollIntoViewIfNeeded();
   const size = await canvas.boundingBox();
   if (!size) throw new Error('Missing body canvas');
   const halfHeight = Math.max(1.12, 0.72 / (size.width / size.height));
   const point = (x: number, y: number) => ({ x: size.width / 2 + x / (2 * halfHeight) * size.height, y: size.height / 2 - y / (2 * halfHeight) * size.height });
   const tap = (position: { x: number; y: number }) => info.project.use.hasTouch ? canvas.tap({ position }) : canvas.click({ position });
   await tap(point(0.1, 0.48));
   await expect(page.getByRole('button', { name: /^Peito: / })).toHaveAttribute('aria-pressed', 'true');
   await tap(point(0, 0.84));
   await expect(page.getByRole('button', { name: /^Peito: / })).toHaveAttribute('aria-pressed', 'false');
   await page.getByRole('button', { name: 'Costas', exact: true }).click();
   await tap(point(0.1, 0.27));
   await expect(page.getByRole('button', { name: /^Costas: / })).toHaveAttribute('aria-pressed', 'true');
   await page.getByRole('button', { name: 'Restaurar posição inicial' }).click();
   const start = point(0.1, 0.48);
   const current = await canvas.boundingBox();
   if (!current) throw new Error('Missing body canvas');
   await page.mouse.move(current.x + start.x, current.y + start.y);
   await page.mouse.down();
   await page.mouse.move(current.x + start.x + 35, current.y + start.y, { steps: 5 });
   await page.mouse.move(current.x + start.x, current.y + start.y, { steps: 5 });
   await page.mouse.up();
   await expect(page.locator('[aria-label="Séries por grupo muscular"] button[aria-pressed="true"]')).toHaveCount(0);
});

test('dark theme preserves readable charts and the profile controls', async ({ page }, info) => {
   test.skip(!['390px', '1440px'].includes(info.project.name), 'Representative mobile and desktop theme checks');
   await page.goto('/profile');
   await page.getByRole('button', { name: 'Ativar modo escuro', exact: true }).last().click();
   await expect(page.locator('html')).toHaveClass(/dark/);
   await page.locator('a[href="/dashboard"]:visible').last().click();
   await assertChartsFit(page);
   await page.screenshot({ path: `test-results/review-${info.project.name}-dark-dashboard.png`, fullPage: true });
});
