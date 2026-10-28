import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'

// Mock Firebase so tests don't modify real data
const mocks = vi.hoisted(() => ({
    requireAuth: vi.fn(),
    getPitStop: vi.fn(),
    addQueueReport: vi.fn(),
}))

vi.mock('@/actions/auth.actions', () => ({
    requireAuth: mocks.requireAuth,
}))

vi.mock('@/lib/firebase/admin', () => ({
    adminDb: {
        collection: (name: string) => {
            if (name === 'pitStops') {
                return {
                    doc: () => ({
                        get: mocks.getPitStop,
                    }),
                }
            }

            if (name === 'queueReports') {
                return {
                    add: mocks.addQueueReport,
                }
            }

            throw new Error('Unknown collection')
        },
    },
}))

vi.mock('firebase-admin/firestore', () => ({
    Timestamp: {
        now: () => 'mock-timestamp',
    },
}))

import { createQueueReport } from './queue.actions'

describe('Pit Stop Queue Reporter', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        // Simulate an authenticated user.
        mocks.requireAuth.mockResolvedValue({
            uid: 'test-user-123',
        })

        // Simulate a valid, active Pit Stop.
        mocks.getPitStop.mockResolvedValue({
            exists: true,
            data: () => ({ isActive: true }),
        })

        mocks.addQueueReport.mockResolvedValue({
            id: 'report-123',
        })
    })

    it('saves a valid queue report', async () => {
        const result = await createQueueReport({
            pitStopId: 'ps1',
            level: 'short',
        })

        expect(result.success).toBe(true)
        expect(result.data).toBe('report-123')

        expect(mocks.addQueueReport).toHaveBeenCalledWith({
            pitStopId: 'ps1',
            uid: 'test-user-123',
            level: 'short',
            createdAt: 'mock-timestamp',
            _schemaVersion: 1,
        })
    })

    it('rejects an invalid queue level', async () => {
        const result = await createQueueReport({
            pitStopId: 'ps1',
            level: 'extremely busy',
        })

        expect(result.success).toBe(false)
        expect(mocks.addQueueReport).not.toHaveBeenCalled()
    })

    it('rejects a Pit Stop that does not exist', async () => {
        mocks.getPitStop.mockResolvedValue({
            exists: false,
        })

        const result = await createQueueReport({
            pitStopId: 'missing',
            level: 'short',
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe('Pit Stop not found')
        expect(mocks.addQueueReport).not.toHaveBeenCalled()
    })

    it('rejects an inactive Pit Stop', async () => {
        mocks.getPitStop.mockResolvedValue({
            exists: true,
            data: () => ({ isActive: false }),
        })

        const result = await createQueueReport({
            pitStopId: 'ps1',
            level: 'long',
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe('This Pit Stop is not active')
        expect(mocks.addQueueReport).not.toHaveBeenCalled()
    })

    it('requires authentication', async () => {
        mocks.requireAuth.mockRejectedValueOnce(
            new Error('Not authenticated')
        )

        await expect(
            createQueueReport({
                pitStopId: 'ps1',
                level: 'short',
            })
        ).rejects.toThrow('Not authenticated')

        expect(mocks.getPitStop).not.toHaveBeenCalled()
        expect(mocks.addQueueReport).not.toHaveBeenCalled()
    })
})
