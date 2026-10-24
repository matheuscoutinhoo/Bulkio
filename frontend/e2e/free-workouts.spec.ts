import { test, expect } from './fixtures';

test('free workouts select catalog exercises, save sets, resume and finish without a ficha', async ({ page }, info) => {
   await page.goto('/logs');
   await page.getByRole('button', { name: 'Registrar treino', exact: true }).click();
   const start = page.getByRole('dialog', { name: 'Iniciar treino' });
   await start.getByRole('button', { name: 'Treino livre', exact: true }).click();
   await expect(start.getByLabel('Ficha de treino')).toHaveCount(0);
   await start.getByLabel('Observações (opcional)').fill('Treino sem ficha');
   await start.screenshot({ path: `test-results/free-workout-${info.project.name}-start.png` });
   const created = page.waitForRequest(request => request.url().includes('/api/v1/workout-logs') && request.method() === 'POST');
   await start.getByRole('button', { name: 'Iniciar treino', exact: true }).click();
   expect((await created).postDataJSON().workoutPlanId).toBeNull();

   let form = page.getByRole('form', { name: 'Registrar série' });
   await expect(form).toBeVisible();
   await form.getByRole('combobox', { name: 'Escolher exercício', exact: true }).fill('flexao');
   await form.getByRole('option', { name: /Flexão de braços/ }).click();
   await expect(form.getByLabel('Carga (kg)')).toHaveValue('80.2');
   await form.getByLabel('Repetições', { exact: true }).fill('12');
   await expect(form.getByLabel('Descanso após a série (segundos)')).toHaveValue('60');
   await form.screenshot({ path: `test-results/free-workout-${info.project.name}-set.png` });
   await form.getByRole('button', { name: 'Salvar série', exact: true }).click();
   await expect(page.getByRole('dialog', { name: 'Descanso', exact: true })).toBeVisible();
   await page.getByRole('button', { name: 'Finalizar descanso', exact: true }).click();
   await expect(page.getByRole('table', { name: 'Séries de Flexão de braços' }).locator('tbody tr')).toHaveCount(1);

   await form.getByRole('combobox', { name: 'Escolher outro exercício', exact: true }).fill('exercício inexistente');
   await form.getByRole('combobox').press('Enter');
   await expect(form.getByText('Nenhum exercício encontrado', { exact: true })).toBeVisible();
   await expect(page.getByRole('dialog', { name: 'Descanso', exact: true })).toHaveCount(0);
   await form.getByRole('combobox', { name: 'Escolher outro exercício', exact: true }).fill('biceps');
   await form.getByRole('option', { name: /Rosca direta/ }).click();
   await form.getByLabel('Carga (kg)').fill('20.5');
   await form.getByLabel('Descanso após a série (segundos)').fill('0');
   await form.getByRole('button', { name: 'Salvar série', exact: true }).click();
   await expect(page.getByRole('table', { name: 'Séries de Rosca direta' }).locator('tbody tr')).toHaveCount(1);
   await expect(page.getByRole('dialog')).toHaveCount(0);

   await page.reload();
   await page.getByRole('button', { name: /Treino livre/, expanded: false }).click();
   await expect(page.getByRole('table', { name: 'Séries de Flexão de braços' }).locator('tbody tr')).toHaveCount(1);
   await expect(page.getByRole('table', { name: 'Séries de Rosca direta' }).locator('tbody tr')).toHaveCount(1);
   await page.getByRole('button', { name: 'Registrar série', exact: true }).click();
   form = page.getByRole('form', { name: 'Registrar série' });
   await form.getByRole('combobox', { name: 'Escolher exercício', exact: true }).fill('Flexão');
   await form.getByRole('combobox').press('Enter');
   await form.getByLabel('Repetições', { exact: true }).fill('10');
   await form.getByLabel('Descanso após a série (segundos)').fill('0');
   await form.getByRole('button', { name: 'Salvar série', exact: true }).click();
   await expect(page.getByRole('table', { name: 'Séries de Flexão de braços' }).locator('tbody tr')).toHaveCount(2);
   await form.getByRole('button', { name: 'Cancelar', exact: true }).click();
   await page.getByRole('button', { name: 'Finalizar', exact: true }).click();
   await expect(page.getByRole('button', { name: /Completo Treino livre/, expanded: true })).toBeVisible();
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
   await page.screenshot({ path: `test-results/free-workout-${info.project.name}-complete.png`, fullPage: true });
});

test('accounts without fichas can retry catalog and save failures without losing their set', async ({ page }, info) => {
   test.skip(!['390px', '1440px'].includes(info.project.name), 'Representative mobile and desktop recovery checks');
   await page.route('**/api/v1/workouts?**', route => route.fulfill({ json: { success: true, data: [], pagination: { totalPages: 0 } } }));
   let catalogFailed = false;
   await page.route('**/api/v1/exercises?**', route => {
      if (!catalogFailed) {
         catalogFailed = true;
         return route.fulfill({ status: 500, json: { success: false, message: 'Catálogo indisponível' } });
      }
      return route.fallback();
   });
   let saveFailed = false;
   await page.route('**/api/v1/workout-logs/new-workout', route => {
      if (route.request().method() === 'PATCH' && !saveFailed) {
         saveFailed = true;
         return route.fulfill({ status: 500, json: { success: false, message: 'Falha temporária ao salvar a série' } });
      }
      return route.fallback();
   });
   await page.goto('/logs');
   await page.getByRole('button', { name: 'Registrar treino', exact: true }).click();
   const start = page.getByRole('dialog', { name: 'Iniciar treino' });
   await expect(start.getByRole('button', { name: 'Treino livre', exact: true })).toHaveAttribute('aria-pressed', 'true');
   await start.getByRole('button', { name: 'Iniciar treino', exact: true }).click();
   await expect(page.getByText('Não foi possível carregar o catálogo de exercícios. Tente registrar a série novamente.', { exact: true })).toBeVisible();
   await page.getByRole('button', { name: 'Registrar série', exact: true }).click();
   const form = page.getByRole('form', { name: 'Registrar série' });
   await form.getByRole('combobox').fill('exercício inexistente');
   await expect(form.getByText('Nenhum exercício encontrado', { exact: true })).toBeVisible();
   await expect(form.getByRole('button', { name: 'Salvar série', exact: true })).toBeDisabled();
   await form.getByRole('combobox').fill('supino');
   await form.getByRole('option', { name: /Supino reto com barra/ }).click();
   await form.getByLabel('Carga (kg)').fill('40');
   await form.getByLabel('Repetições', { exact: true }).fill('8');
   await form.getByLabel('Descanso após a série (segundos)').fill('0');
   await form.getByRole('button', { name: 'Salvar série', exact: true }).click();
   await expect(form.getByRole('alert')).toHaveText('Falha temporária ao salvar a série');
   await expect(form.getByLabel('Carga (kg)')).toHaveValue('40');
   await expect(form.getByLabel('Repetições', { exact: true })).toHaveValue('8');
   await form.getByRole('button', { name: 'Salvar série', exact: true }).click();
   await expect(page.getByRole('table', { name: 'Séries de Supino reto com barra' }).locator('tbody tr')).toHaveCount(1);
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
