import { mount, unmount } from 'svelte';
import './quickcv-styles';
import QuickCvApp from './QuickCvApp.svelte';

export function mountQuickCv(target: HTMLElement) {
  return mount(QuickCvApp, { target });
}

export function unmountQuickCv(handle: ReturnType<typeof mountQuickCv>) {
  unmount(handle);
}
