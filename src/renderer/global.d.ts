/**
 * Global Type Declarations for Renderer Process
 * 
 * Extends the Window interface with the Matriarch API.
 * This enables TypeScript autocomplete for window.matriarch in renderer code.
 */

import type { MatriarchApi } from '../shared/api/contracts'
import type { IpcRenderer } from 'electron'

declare global {
    interface Window {
        /** Typed Matriarch API for renderer-to-main communication */
        matriarch: MatriarchApi

        /** @deprecated Use window.matriarch instead */
        ipcRenderer: {
            on: IpcRenderer['on']
            off: IpcRenderer['off']
            send: IpcRenderer['send']
            invoke: IpcRenderer['invoke']
        }
    }
}

export { }
