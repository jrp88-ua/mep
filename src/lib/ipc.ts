import { invoke } from '@tauri-apps/api';
import type { InvokeArgs } from '@tauri-apps/api/tauri';
import { debug } from 'tauri-plugin-log-api';

export async function ipc_invoke<T>(method: string, params?: InvokeArgs | undefined): Promise<T> {
	debug(`Calling ${method}`);
	try {
		return await invoke(method, params);
	} catch (e) {
		throw new Error(e as string);
	}
}
