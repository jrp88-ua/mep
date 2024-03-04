import type { Actions } from './$types';
import { store } from '$lib/stores/examinees';
import type { ExamineeOrigin } from '../../../types/ExamineeOrigin';

export const actions: Actions = {
    default: async ({request}) => {
        const formData = await request.formData();
        
        store.createExaminee({
            name: formData.get("name") as string,
            surenames: formData.get("surenames") as string,
            origin: formData.get("origin") as ExamineeOrigin,
            court_number: Number(formData.get("court")),
        })
    },
};