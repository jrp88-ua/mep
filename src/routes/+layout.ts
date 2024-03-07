import '@fortawesome/fontawesome-free/css/all.min.css';
import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
import { storePopup } from '@skeletonlabs/skeleton';

//export const prerender = true;
export const ssr = false;
//export const csr = true;

storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
