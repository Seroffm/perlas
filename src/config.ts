const demoFormFlag = import.meta.env.VITE_PERLAS_DEMO_FORM_SUCCESS?.trim().toLowerCase()

export const DEMO_FORM_SUCCESS = demoFormFlag !== 'false'
export const DEMO_FORM_SUBMIT_DELAY_MS = 850
