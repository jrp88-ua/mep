import * as m from '$paraglide/messages';
import { assignment } from '$lib/assignment/assign';
import type { getModalStore } from '@skeletonlabs/skeleton';
import { get } from 'svelte/store';

export function showActionWillDeleteAssignment(
	modalStore: ReturnType<typeof getModalStore>
): Promise<boolean> {
	if (get(assignment) === undefined) return Promise.resolve(true);
	return new Promise((resolve) => {
		modalStore.trigger({
			type: 'confirm',
			title: m.action_will_delete_assignment_title(),
			body: m.action_will_delete_assignment_message(),
			buttonTextConfirm: m.action_will_delete_assignment_confirm(),
			buttonTextCancel: m.action_will_delete_assignment_cancel(),
			response(doDelete: boolean) {
				if (doDelete) assignment.removeAssignation();
				resolve(doDelete);
			}
		});
	});
}
