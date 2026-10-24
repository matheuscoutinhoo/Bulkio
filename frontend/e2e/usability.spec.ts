import { test, expect, dashboardStats, user } from './fixtures';
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

async function assertNoChartOutline(page: Page) {
   const outlines = await page.locator('.chart-frame').evaluateAll(frames => frames.flatMap(frame => [...frame.querySelectorAll('*')].flatMap(element => {
      const style = getComputedStyle(element);
      return style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0
         ? [{ tag: element.tagName, class: element.getAttribute('class'), outline: style.outline }]
         : [];
   })));
   expect(outlines).toEqual([]);
}

test('dashboard and weight charts fit; touches do not select the whole chart', async ({ page }, info) => {
   for (const path of ['/dashboard', '/body-weight']) {
      await page.goto(path);
      await assertChartsFit(page);
      await assertTablesFit(page);
      for (const surface of await page.locator('.chart-frame svg.recharts-surface').all()) {
         await surface.scrollIntoViewIfNeeded();
         // Different hit targets focus Recharts' grid and data <g> portals,
         // even though those inner layers have tabindex=-1.
         for (const position of [{ x: 120, y: 70 }, { x: 180, y: 150 }, { x: 100, y: 220 }]) {
            if (info.project.use.hasTouch) await surface.tap({ position });
            else await surface.click({ position });
            await assertNoChartOutline(page);
         }
         await surface.dblclick({ position: { x: 120, y: 70 } });
         expect(await page.evaluate(() => window.getSelection()?.toString() || '')).toBe('');
         expect(await surface.evaluate(element => getComputedStyle(element).userSelect)).toBe('none');
         await assertNoChartOutline(page);
         await surface.locator('g[tabindex="-1"]').first().focus();
         await assertNoChartOutline(page);
         await surface.focus();
         await page.keyboard.press('ArrowRight');
         await expect(surface.locator('..').locator('.recharts-tooltip-wrapper')).toBeVisible();
         await assertNoChartOutline(page);
      }
      await page.getByRole('heading', { level: 1 }).click();
      await assertChartsFit(page);
      await page.getByRole('table').first().screenshot({ path: `test-results/table-${info.project.name}-${path.slice(1)}.png` });
      await page.screenshot({ path: `test-results/review-${info.project.name}-${path.slice(1)}.png`, fullPage: true });
   }
});

test('workout library search, quick start, history filters and progression work', async ({ page }, info) => {
   await page.goto('/workouts');
   await expect(page.getByRole('heading', { name: 'Fichas cadastradas', exact: true })).toBeVisible();
   await page.getByRole('textbox', { name: 'Buscar fichas' }).fill('pernas');
   await expect(page.getByRole('button', { name: 'Treinar agora' })).toHaveCount(1);
   await page.getByRole('textbox', { name: 'Buscar fichas' }).fill('');
   await page.locator('button[aria-expanded="false"]').first().click();
   await assertTablesFit(page);
   await page.getByRole('table').first().screenshot({ path: `test-results/table-${info.project.name}-workouts.png` });
   await page.screenshot({ path: `test-results/review-${info.project.name}-workouts.png`, fullPage: true });
   await page.getByRole('button', { name: 'Treinar agora' }).first().click();
   await expect(page).toHaveURL(/\/logs\?workout=new-workout/);
   await expect(page.getByRole('button', { name: 'Registrar série', exact: true })).toBeVisible();
   await page.goto('/logs');
   await page.getByRole('button', { name: 'Concluídos', exact: true }).click();
   await expect(page.getByText('Completo', { exact: true })).toHaveCount(2);
   await page.locator('button[aria-expanded="false"]').first().click();
   await assertTablesFit(page);
   await page.getByRole('button', { name: /^Editar série 1 de/ }).first().click();
   await expect(page.getByRole('form', { name: 'Editar série 1' })).toBeVisible();
   await assertTablesFit(page);
   await page.screenshot({ path: `test-results/review-${info.project.name}-edit-series.png`, fullPage: true });
   await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
   await page.getByRole('table').first().screenshot({ path: `test-results/table-${info.project.name}-series.png` });
   await page.screenshot({ path: `test-results/review-${info.project.name}-logs.png`, fullPage: true });
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
   await page.getByRole('button', { name: 'Restaurar posição inicial' }).click();
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

async function assertTablesFit(page: Page) {
   await expect(page.locator('.data-table').first()).toBeVisible();
   expect(await page.locator('.data-table').evaluateAll(tables => tables.flatMap(table => {
      const bounds = table.getBoundingClientRect();
      return table.scrollWidth <= table.clientWidth + 1 && bounds.right <= innerWidth + 1 ? []
         : [{ name: table.querySelector('table')?.getAttribute('aria-label'), contentWidth: table.scrollWidth, availableWidth: table.clientWidth, right: bounds.right }];
   }))).toEqual([]);
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
   expect(await page.locator('.data-table button').evaluateAll(buttons => buttons.flatMap(button => {
      const bounds = button.getBoundingClientRect();
      return bounds.width > 0 && (bounds.width < 44 || bounds.height < 44) ? [{ label: button.getAttribute('aria-label') || button.textContent, width: bounds.width, height: bounds.height }] : [];
   }))).toEqual([]);
   expect(await page.locator('.data-table--cards tbody tr').evaluateAll(rows => rows.every(row => getComputedStyle(row).display === (innerWidth < 640 ? 'grid' : 'table-row')))).toBe(true);
}

test('muscle list shows trained groups only and selections turn the model to the right side', async ({ page }, info) => {
   if (['390px', '1440px'].includes(info.project.name)) await page.emulateMedia({ reducedMotion: 'no-preference' });
   await page.route('**/dashboard/stats?**', route => route.fulfill({ json: { success: true, data: { ...dashboardStats, muscleDistribution: { CHEST: 4, BACK: 3, CALVES: 2, ABS: 0 } } } }));
   await page.goto('/dashboard');
   const list = page.getByRole('list', { name: 'Séries por grupo muscular' });
   await expect(list.getByRole('button')).toHaveCount(3);
   await expect(page.getByRole('button', { name: 'Costas', exact: true })).toBeEnabled();
   await list.getByRole('button', { name: /^Costas: / }).click();
   await expect(page.getByRole('group', { name: 'Modelo corporal 3D rotacionável' })).toHaveAttribute('aria-busy', 'false');
   const canvas = page.getByRole('group', { name: 'Modelo corporal 3D rotacionável' }).locator('canvas');
   await canvas.scrollIntoViewIfNeeded();
   const size = await canvas.boundingBox();
   if (!size) throw new Error('Missing body canvas');
   const halfHeight = Math.max(1.12, 0.72 / (size.width / size.height));
   // Back's reference point after centering at y=.3 and zooming 1.3.
   const position = { x: size.width / 2 - 0.1 / (2 * halfHeight) * size.height * 1.3, y: size.height / 2 - (0.27 - 0.3) / (2 * halfHeight) * size.height * 1.3 };
   if (info.project.use.hasTouch) await canvas.tap({ position });
   else await canvas.click({ position });
   await expect(list.getByRole('button', { name: /^Costas: / })).toHaveAttribute('aria-pressed', 'true');
   await list.getByRole('button', { name: /^Peito: / }).click();
   await expect(page.getByRole('group', { name: 'Modelo corporal 3D rotacionável' })).toHaveAttribute('aria-busy', 'false');
   await canvas.scrollIntoViewIfNeeded();
   const chest = { x: size.width / 2 + 0.1 / (2 * halfHeight) * size.height * 1.3, y: size.height / 2 - (0.48 - 0.35) / (2 * halfHeight) * size.height * 1.3 };
   if (info.project.use.hasTouch) await canvas.tap({ position: chest });
   else await canvas.click({ position: chest });
   await expect(list.getByRole('button', { name: /^Peito: / })).toHaveAttribute('aria-pressed', 'true');
   await list.getByRole('button', { name: /^Panturrilha: / }).click();
   await expect(page.getByRole('group', { name: 'Modelo corporal 3D rotacionável' })).toHaveAttribute('aria-busy', 'false');
   await canvas.scrollIntoViewIfNeeded();
   await page.screenshot({ path: `test-results/review-${info.project.name}-focused-calves.png`, fullPage: true });
   await page.route('**/dashboard/stats?**', route => route.fulfill({ json: { success: true, data: { ...dashboardStats, muscleDistribution: {} } } }));
   await page.goto('/dashboard');
   await expect(list.getByRole('button')).toHaveCount(0);
   await expect(page.getByText('Nenhum grupo com séries registradas neste período.')).toBeVisible();
});

test('weight progress includes records beyond the first page and uses the historical starting weight', async ({ page }) => {
   const history = Array.from({ length: 101 }, (_, i) => ({ id: `historic-${i}`, weight: 80 + i / 10, date: new Date(Date.UTC(2026, 9, 24 - i, 12)).toISOString(), createdAt: '2026-10-24T12:00:00Z' }));
   await page.route('**/auth/profile', route => route.fulfill({ json: { success: true, data: { ...user, initialWeight: 80, targetWeight: 70 } } }));
   await page.route(/\/api\/v1\/body-weight(?:\?|$)/, route => {
      const pageNumber = Number(new URL(route.request().url()).searchParams.get('page'));
      return route.fulfill({ json: { success: true, data: history.slice((pageNumber - 1) * 100, pageNumber * 100), pagination: { totalPages: 2 } } });
   });
   await page.goto('/body-weight');
   await expect(page.getByRole('progressbar', { name: 'Progresso até a meta de peso' })).toHaveAttribute('aria-valuenow', '50');
   await expect(page.getByText(/^Base: 90 kg, primeiro registro/)).toBeVisible();
   const table = page.getByRole('table', { name: 'Histórico de peso corporal' });
   await expect(table.locator('tbody tr')).toHaveCount(10);
   await expect(page.getByText('101 registros', { exact: true })).toBeVisible();
   await expect(page.getByRole('button', { name: 'Página anterior de pesos' })).toBeDisabled();
   await page.getByRole('button', { name: 'Próxima página de pesos' }).click();
   await expect(page.getByRole('combobox', { name: 'Página do histórico de peso' })).toHaveValue('2');
   await expect(table.locator('tbody tr').first().getByRole('cell').first()).toContainText('81');
   await expect(page.getByRole('progressbar', { name: 'Progresso até a meta de peso' })).toHaveAttribute('aria-valuenow', '50');
   await page.getByRole('button', { name: 'Página anterior de pesos' }).click();
   await page.getByRole('combobox', { name: 'Página do histórico de peso' }).selectOption('11');
   await expect(table.locator('tbody tr')).toHaveCount(1);
   await expect(table.locator('tbody tr').first().getByRole('cell').first()).toContainText('90');
   await expect(page.getByRole('button', { name: 'Próxima página de pesos' })).toBeDisabled();
   await assertTablesFit(page);
   await assertChartsFit(page);
   await page.getByRole('button', { name: 'Definir meta', exact: true }).click();
   await expect(page.getByLabel('Peso inicial (kg)')).toHaveValue('90');
   await expect(page.getByLabel('Peso inicial (kg)')).toHaveAttribute('readonly', '');
});

test('dark theme preserves readable charts and the profile controls', async ({ page }, info) => {
   test.skip(!['390px', '1440px'].includes(info.project.name), 'Representative mobile and desktop theme checks');
   await page.goto('/profile');
   await page.getByRole('button', { name: 'Ativar modo escuro', exact: true }).last().click();
   await expect(page.locator('html')).toHaveClass(/dark/);
   await page.locator('a[href="/dashboard"]:visible').last().click();
   await assertChartsFit(page);
   await page.screenshot({ path: `test-results/review-${info.project.name}-dark-dashboard.png`, fullPage: true });
   await page.locator('a[href="/workouts"]:visible').last().click();
   await page.locator('button[aria-expanded="false"]').first().click();
   await assertTablesFit(page);
   await page.getByRole('table').first().screenshot({ path: `test-results/table-${info.project.name}-dark-workouts.png` });
   await page.locator('a[href="/logs"]:visible').last().click();
   await page.locator('button[aria-expanded="false"]').first().click();
   await assertTablesFit(page);
   await page.getByRole('table').first().screenshot({ path: `test-results/table-${info.project.name}-dark-series.png` });
});
