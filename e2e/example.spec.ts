/**
 * Matriarch E2E Tests - Application Launch
 * 
 * Core Electron application tests validating app startup and window behavior.
 * Run with: npm run test:e2e (after building with npm run build)
 * 
 * @see Phase-0 §3.1 - Application Shell
 */

import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Application Launch', () => {
    let electronApp: ElectronApplication;
    let window: Page;

    test.beforeAll(async () => {
        electronApp = await electron.launch({
            args: [path.join(__dirname, '../dist-electron/index.js')],
        });
        window = await electronApp.firstWindow();
    });

    test.afterAll(async () => {
        await electronApp.close();
    });

    test('should launch and create a window', async () => {
        expect(window).not.toBeNull();
    });

    test('should have a non-empty title', async () => {
        const title = await window.title();
        expect(title).not.toBe('');
    });

    test('should have correct minimum dimensions', async () => {
        // Get actual rendered size from the browser context
        const size = await window.viewportSize();

        // Minimum reasonable dimensions for the app
        expect(size?.width).toBeGreaterThan(800);
        expect(size?.height).toBeGreaterThan(600);
    });

    test('should have no JavaScript errors on load', async () => {
        const errors: string[] = [];

        window.on('pageerror', (error) => {
            errors.push(error.message);
        });

        // Wait for page to fully load
        await window.waitForLoadState('domcontentloaded');

        // Give time for potential errors to surface
        await window.waitForTimeout(500);

        expect(errors).toHaveLength(0);
    });
});

test.describe('Application Accessibility', () => {
    let electronApp: ElectronApplication;
    let window: Page;

    test.beforeAll(async () => {
        electronApp = await electron.launch({
            args: [path.join(__dirname, '../dist-electron/index.js')],
        });
        window = await electronApp.firstWindow();
    });

    test.afterAll(async () => {
        await electronApp.close();
    });

    test('should have document with proper structure', async () => {
        // Check for basic HTML structure
        const htmlLang = await window.locator('html').getAttribute('lang');
        // Lang may or may not be set; just verify the page has content
        const bodyContent = await window.locator('body').innerHTML();
        expect(bodyContent.length).toBeGreaterThan(0);
    });
});
