import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseURL = process.env.TODO_APP_URL ?? "http://127.0.0.1:4173";
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(baseURL);

  assert.equal(await page.title(), "오늘의 할 일");
  assert.equal(await page.locator("#empty-state").isVisible(), true);

  await page.locator("#todo-input").fill("야유회 준비물 챙기기");
  await page.locator("#todo-form button[type='submit']").click();
  await page.locator("#todo-input").fill("출발 시간 확인하기");
  await page.locator("#todo-form button[type='submit']").click();

  assert.equal(await page.locator(".todo-item").count(), 2);
  assert.equal(await page.locator("#remaining-count").textContent(), "2개 남음");

  await page.locator(".todo-item").first().locator("[data-action='toggle']").click();
  assert.equal(await page.locator(".todo-item.completed").count(), 1);
  assert.equal(await page.locator("#completed-count").textContent(), "1");

  await page.reload();
  assert.equal(await page.locator(".todo-item").count(), 2, "새로고침 후 할 일이 유지되어야 합니다.");
  assert.equal(await page.locator(".todo-item.completed").count(), 1);

  await page.locator(".todo-item").last().locator("[data-action='delete']").click();
  assert.equal(await page.locator(".todo-item").count(), 1);

  await page.locator("#clear-completed").click();
  assert.equal(await page.locator(".todo-item").count(), 0);
  assert.equal(await page.locator("#empty-state").isVisible(), true);

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  assert.equal(hasHorizontalOverflow, false, "모바일 화면에서 가로 스크롤이 생기면 안 됩니다.");

  console.log("PASS: 추가, 완료, 삭제, 완료 일괄 삭제, localStorage, 390px 반응형 검증");
} finally {
  await browser.close();
}
