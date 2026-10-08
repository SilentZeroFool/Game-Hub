import { isTauri, invoke } from '@tauri-apps/api/core';
import { LaunchMethod } from '../types';

/**
 * Checks if running inside the Pure Native Windows .NET WebView2 container.
 */
export function isPureNativeWindows(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).__GAME_HUB_NATIVE__ ||
    (window as any).chrome?.webview
  );
}

/**
 * Checks if running in any desktop environment (Tauri OR Pure Native Windows).
 */
export function isDesktopApp(): boolean {
  return isTauri() || isPureNativeWindows();
}

/**
 * Sends a message to the C# Pure Native host via WebView2 postMessage and awaits response.
 */
function sendNativeMessage<T = any>(action: string, payload: Record<string, any> = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    const webview = (window as any).chrome?.webview;
    if (!webview || typeof webview.postMessage !== 'function') {
      reject(new Error('Pure native Windows bridge is not available.'));
      return;
    }

    const id = 'msg_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();

    // 2-minute timeout for user interactions like file browsing dialogs
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Native request '${action}' timed out.`));
    }, 120000);

    const messageHandler = (event: any) => {
      try {
        const raw = event.data;
        const msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (msg && msg.id === id) {
          cleanup();
          if (msg.error) {
            reject(new Error(msg.error));
          } else {
            resolve(msg.data as T);
          }
        }
      } catch {
        // ignore parse errors or unrelated messages
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      try {
        webview.removeEventListener('message', messageHandler);
      } catch {
        // ignore
      }
    };

    try {
      webview.addEventListener('message', messageHandler);
      webview.postMessage({ id, action, ...payload });
    } catch (err) {
      cleanup();
      reject(err);
    }
  });
}

/**
 * Opens a native file dialog to choose a game executable or shortcut.
 */
export async function browseExecutableFile(): Promise<string | null> {
  // 1. Pure Native Windows (.NET WebView2)
  if (isPureNativeWindows()) {
    try {
      const selected = await sendNativeMessage<string | null>('browse_file');
      return selected && typeof selected === 'string' ? selected : null;
    } catch (err: any) {
      console.warn('Native browse_file failed:', err);
      throw err;
    }
  }

  // 2. Tauri desktop app
  if (isTauri()) {
    const dialogModule = await import('@tauri-apps/plugin-dialog').catch(() => null);
    const openFn = dialogModule?.open ?? dialogModule?.default?.open ?? (dialogModule as any)?.open;

    if (typeof openFn === 'function') {
      const selected = await openFn({
        multiple: false,
        filters: [
          {
            name: 'Executables and Shortcuts',
            extensions: ['exe', 'app', 'sh', 'bat', 'cmd', 'lnk', 'url'],
          },
        ],
      });

      if (selected && typeof selected === 'string') {
        return selected;
      }
      return null;
    }
    throw new Error('Tauri file dialog plugin is not available.');
  }

  // 3. Web fallback
  throw new Error('File browsing is only available in the desktop app (Tauri or Pure Native Windows).');
}

/**
 * Launches a game using the specified method across Tauri or Pure Native Windows.
 */
export async function launchGameNative(exePath: string, method: LaunchMethod = 'cmd_start'): Promise<void> {
  if (!exePath || exePath === 'dummy://path') {
    throw new Error('Invalid executable path provided.');
  }

  // 1. Pure Native Windows (.NET WebView2)
  if (isPureNativeWindows()) {
    await sendNativeMessage('run_game', { path: exePath, method });
    return;
  }

  // 2. Tauri desktop app
  if (isTauri()) {
    if (method === 'tauri_shell') {
      const shellModule = await import('@tauri-apps/plugin-shell').catch(() => null);
      const openFn = shellModule?.open ?? (shellModule as any)?.default?.open ?? shellModule?.default;

      if (typeof openFn === 'function') {
        try {
          await openFn(exePath);
          return;
        } catch (shellErr) {
          console.warn('shell.open failed, trying fallback invoke run_game:', shellErr);
          await invoke('run_game', { path: exePath, method: 'cmd_start' });
          return;
        }
      } else {
        await invoke('run_game', { path: exePath, method: 'cmd_start' });
        return;
      }
    } else {
      await invoke('run_game', { path: exePath, method });
      return;
    }
  }

  // 3. Web fallback
  throw new Error('Launching games is only supported in the desktop app (Tauri or Pure Native Windows).');
}

/**
 * Minimizes the host application window upon game launch (if user enabled the setting).
 */
export async function minimizeNativeWindow(): Promise<void> {
  if (isPureNativeWindows()) {
    try {
      await sendNativeMessage('minimize');
    } catch (err) {
      console.warn('Failed to minimize native window:', err);
    }
    return;
  }

  if (isTauri()) {
    try {
      const windowModule = await import('@tauri-apps/api/window').catch(() => null);
      const getCurrentWindow = windowModule?.getCurrentWindow ?? (windowModule as any)?.default?.getCurrentWindow;
      if (typeof getCurrentWindow === 'function') {
        const w = getCurrentWindow();
        if (w?.minimize) await w.minimize();
      }
    } catch (err) {
      console.warn('Failed to minimize Tauri window:', err);
    }
  }
}
