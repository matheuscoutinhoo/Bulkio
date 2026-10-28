import { test, expect, user, type TestAccount } from './fixtures';
import type { Page, TestInfo } from '@playwright/test';

const newAccount: TestAccount = { ...user, id: 'new-user', username: 'Nova pessoa', goal: null, height: null, initialWeight: null, targetWeight: null, onboardingStatus: 'PENDING' };
const advance = (page: Page) => page.getByRole('button', { name: 'Continuar', exact: true }).click();
async function checkLayout(page: Page, info: TestInfo, name: string) {
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
   expect(await page.locator('main button, header button, main input').evaluateAll(elements => elements.every(element => {
      const box = element.getBoundingClientRect();
      return !box.width || (box.width >= 44 && box.height >= 44);
   }))).toBe(true);
   const next = page.getByRole('button', { name: /^(Continuar|Concluir)$/ });
   const bounds = await next.boundingBox();
   expect(bounds).not.toBeNull();
   expect(bounds!.y).toBeGreaterThanOrEqual(0);
   expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
   await page.screenshot({ path: `test-results/onboarding-${info.project.name}-${name}.png`, fullPage: true });
}

test.describe('initial setup for new accounts', () => {
   test.use({ account: newAccount, weightRecords: [] });

   test('presents features, resumes a draft, validates data and retries completion without duplicating weight', async ({ page }, info) => {
      test.setTimeout(60000);
      let failed = false;
      await page.route('**/api/v1/auth/onboarding', route => {
         if (!failed) { failed = true; return route.fulfill({ status: 500, json: { success: false, message: 'Não foi possível salvar agora' } }); }
         return route.fallback();
      });
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/onboarding$/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Primeiros passos no Bulkio');
      await expect(page.getByRole('heading', { name: 'Fichas e treino livre', exact: true })).toBeVisible();
      await checkLayout(page, info, 'overview');
      await advance(page);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fichas ou treino livre');
      await expect(page.getByRole('heading', { name: 'Timer de descanso', exact: true })).toBeVisible();
      await checkLayout(page, info, 'workouts');
      await advance(page);
      await advance(page);
      await expect(page.getByText('Informe sua altura em centímetros, entre 50 e 300. Exemplo: 176.', { exact: true })).toBeVisible();
      await page.getByLabel('Altura (cm)', { exact: true }).fill('176,5');
      await page.getByLabel('Peso atual (kg)', { exact: true }).fill('75,5');
      await checkLayout(page, info, 'measurements');
      await page.reload();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Altura e peso');
      await expect(page.getByLabel('Altura (cm)', { exact: true })).toHaveValue('176,5');
      await expect(page.getByLabel('Peso atual (kg)', { exact: true })).toHaveValue('75,5');
      await advance(page);
      await advance(page);
      await expect(page.getByText('Selecione um objetivo para continuar.', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: /Manutenção/ }).click();
      await page.getByLabel('Peso alvo (kg, opcional)', { exact: true }).fill('999');
      await advance(page);
      await expect(page.getByText('Informe uma meta entre 20 e 500 kg ou deixe o campo vazio.', { exact: true })).toBeVisible();
      await page.getByLabel('Peso alvo (kg, opcional)', { exact: true }).fill('');
      await checkLayout(page, info, 'goal');
      await advance(page);
      await expect(page.getByText('176,5 cm', { exact: true })).toBeVisible();
      await expect(page.getByText('75,5 kg', { exact: true })).toBeVisible();
      await checkLayout(page, info, 'review');
      await page.getByRole('button', { name: 'Concluir', exact: true }).click();
      await expect(page.getByRole('alert')).toHaveText('Não foi possível salvar agora');
      await expect(page.getByRole('alert')).toBeInViewport({ ratio: 1 });
      const saved = page.waitForRequest(request => request.url().endsWith('/auth/onboarding') && request.method() === 'POST');
      await page.getByRole('button', { name: 'Concluir', exact: true }).click();
      expect((await saved).postDataJSON()).toEqual({ height: 176.5, weight: 75.5, goal: 'MAINTAIN', targetWeight: null });
      await expect(page).toHaveURL(/\/dashboard$/);
      await expect(page.getByText('75.5kg', { exact: true })).toBeVisible();
      await expect(page.locator('.chart-frame .recharts-dot').first()).toBeVisible();
      await page.reload();
      await expect(page).toHaveURL(/\/dashboard$/);
      await page.goto('/body-weight');
      await expect(page.getByRole('table', { name: 'Histórico de peso corporal' }).locator('tbody tr')).toHaveCount(1);
   });

   test('can defer setup and resume the saved measures later', async ({ page }, info) => {
      test.skip(!['390px', '1440px'].includes(info.project.name), 'Representative defer and resume checks');
      await page.goto('/onboarding');
      await advance(page); await advance(page);
      await page.getByLabel('Altura (cm)', { exact: true }).fill('180');
      await page.getByLabel('Peso atual (kg)', { exact: true }).fill('80');
      await page.getByRole('button', { name: 'Continuar depois', exact: true }).click();
      await expect(page).toHaveURL(/\/dashboard$/);
      await page.reload();
      await expect(page).toHaveURL(/\/dashboard$/);
      await page.getByRole('link', { name: 'Retomar configuração', exact: true }).click();
      await expect(page.getByLabel('Altura (cm)', { exact: true })).toHaveValue('180');
      await expect(page.getByLabel('Peso atual (kg)', { exact: true })).toHaveValue('80');
      await advance(page);
      await page.getByRole('button', { name: /Perda de gordura/ }).click();
      await page.getByLabel('Peso alvo (kg, opcional)', { exact: true }).fill('75');
      await advance(page);
      await page.getByRole('button', { name: 'Concluir', exact: true }).click();
      await expect(page).toHaveURL(/\/dashboard$/);
   });

   test('keeps the guide and data entry readable in dark mode', async ({ page }, info) => {
      test.skip(!['390px', '1440px'].includes(info.project.name), 'Representative dark-mode guide checks');
      await page.addInitScript(() => localStorage.setItem('bulkio-theme', JSON.stringify({ state: { theme: 'dark' }, version: 0 })));
      await page.goto('/onboarding');
      await expect(page.locator('html')).toHaveClass(/dark/);
      await checkLayout(page, info, 'dark-overview');
      await advance(page); await advance(page);
      await page.getByLabel('Altura (cm)', { exact: true }).fill('170');
      await page.getByLabel('Peso atual (kg)', { exact: true }).fill('70');
      await checkLayout(page, info, 'dark-measurements');
      await advance(page);
      await page.getByRole('button', { name: /Ganho de massa/ }).click();
      await page.getByLabel('Peso alvo (kg, opcional)', { exact: true }).fill('75');
      await advance(page);
      await checkLayout(page, info, 'dark-review');
   });
});

test.describe('registration entry', () => {
   test.use({ account: newAccount, authenticated: false, weightRecords: [] });
   test('opens the guide immediately after creating an account', async ({ page }) => {
      await page.goto('/register');
      await page.getByLabel('Nome de usuário', { exact: true }).fill('Novo usuário');
      await page.getByLabel('Email', { exact: true }).fill('novo@example.test');
      await page.getByLabel('Senha', { exact: true }).fill('onboard-test-123');
      await page.getByLabel('Confirmar senha', { exact: true }).fill('onboard-test-123');
      await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
      await expect(page).toHaveURL(/\/onboarding$/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Primeiros passos no Bulkio');
   });
});

test('existing accounts can review setup from the profile without a forced tour or duplicate measurements', async ({ page }, info) => {
   test.skip(!['390px', '1440px'].includes(info.project.name), 'Representative existing-account checks');
   await page.goto('/dashboard');
   await expect(page).toHaveURL(/\/dashboard$/);
   await page.goto('/profile');
   await page.getByRole('button', { name: /Rever guia e dados iniciais/ }).click();
   await advance(page); await advance(page);
   await expect(page.getByLabel('Peso atual (kg)', { exact: true })).toHaveValue('80.2');
   await expect(page.getByLabel('Peso atual (kg)', { exact: true })).toHaveAttribute('readonly', '');
   await page.getByLabel('Altura (cm)', { exact: true }).fill('177');
   await advance(page); await advance(page);
   await page.getByRole('button', { name: 'Concluir', exact: true }).click();
   await expect(page).toHaveURL(/\/dashboard$/);
   await page.goto('/body-weight');
   await expect(page.getByText('12 registros', { exact: true })).toBeVisible();
});
