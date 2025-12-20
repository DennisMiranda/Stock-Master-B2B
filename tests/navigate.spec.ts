
import { test, expect } from '@playwright/test';

test('medir rendimiento de carga de productos destacados en shop home', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('http://localhost:4200/shop/home', { waitUntil: 'networkidle' });

  // Esperar a que el texto "Productos Destacados" sea visible.
  // Ajusta este selector si el texto o el elemento real es diferente en tu HTML.
  await page.waitForSelector('text="Productos Destacados"', { state: 'visible' });

  const endTime = Date.now();
  const loadingTime = endTime - startTime;

  console.log(`Tiempo de carga para "Productos Destacados": ${loadingTime} ms`);

  // Puedes añadir una aserción para asegurarte de que el tiempo de carga está dentro de un rango aceptable
  // await expect(loadingTime).toBeLessThan(5000); // Por ejemplo, menos de 5 segundos
});
