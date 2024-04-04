import { invoke } from '@tauri-apps/api';
import type { InvokeArgs } from '@tauri-apps/api/tauri';
import { debug } from 'tauri-plugin-log-api';

export async function ipc_invoke<T>(method: string, params?: InvokeArgs | undefined): Promise<T> {
	debug(`Calling ${method}`);
	return invoke(method, params);
}

export async function ipc_invoke_result<T, E>(
	method: string,
	params?: InvokeArgs | undefined
): Promise<{ success: true; value: T } | { success: false; error: E }> {
	debug(`Calling ${method} with result`);
	try {
		return {
			success: true,
			value: await invoke(method, params)
		};
	} catch (e) {
		return {
			success: false,
			error: e as E
		};
	}
}
