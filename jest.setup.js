// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '.env.local') })

