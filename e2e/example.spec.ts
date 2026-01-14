import { test, expect, _electron as electron } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('app launches', async () => {
    const electronApp = await electron.launch({
        args: [path.join(__dirname, '../dist-electron/index.js')],
    });

    const window = await electronApp.firstWindow();
    // Simply checking if window opens and is not null
    expect(window).not.toBeNull();
    // Check title to be sure
    expect(await window.title()).not.toBe('');

    await electronApp.close();
});
