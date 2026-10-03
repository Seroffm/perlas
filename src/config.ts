const demoFormFlag = import.meta.env.VITE_PERLAS_DEMO_FORM_SUCCESS?.trim().toLowerCase()

export const DEMO_FORM_SUCCESS = import.meta.env.DEV && demoFormFlag === 'true'
export const DEMO_FORM_SUBMIT_DELAY_MS = 850
