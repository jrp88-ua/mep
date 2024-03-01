import { invoke } from '@tauri-apps/api';
import type { InvokeArgs } from '@tauri-apps/api/tauri';
import { debug } from 'tauri-plugin-log-api';

export async function ipc_invoke<T>(method: string, params?: InvokeArgs | undefined): Promise<T> {
	debug(`Calling ${method}`);
	const response: { error: string | null; result: T } = await invoke(method, params);
	if (response.error != null) {
		throw new Error(response.error);
	} else {
		return response.result;
	}
}
