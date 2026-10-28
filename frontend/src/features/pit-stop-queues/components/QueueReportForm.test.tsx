
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createQueueReport } from '../actions/queue.actions'
import { QueueReportForm } from './QueueReportForm'
import type { PitStop } from '@/types/firestore'

vi.mock('../actions/queue.actions', () => ({
    createQueueReport: vi.fn(),
}))

const mockCreateReport = vi.mocked(createQueueReport)

const pitStops: PitStop[] = [
    {
        id: 'ps1',
        name: 'Pit Stop A',
        location: 'Demo Area A',
        isActive: true,
        _schemaVersion: 1,
    },
    {
        id: 'ps2',
        name: 'Pit Stop B',
        location: 'Demo Area B',
        isActive: true,
        _schemaVersion: 1,
    },
]

describe('QueueReportForm', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('submits a valid queue report', async () => {
        const user = userEvent.setup()

        mockCreateReport.mockResolvedValue({
            success: true,
            data: 'report-123',
        })

        render(
            <QueueReportForm
                pitStops={pitStops}
                selectedPitStopId="ps1"
                onSelectedPitStopChange={vi.fn()}
            />
        )

        await user.click(
            screen.getByRole('radio', { name: 'Long queue' })
        )

        await user.click(
            screen.getByRole('button', { name: 'Submit Report' })
        )

        expect(mockCreateReport).toHaveBeenCalledWith({
            pitStopId: 'ps1',
            level: 'long',
        })

        expect(await screen.findByRole('status')).toHaveTextContent(
            'Queue report submitted successfully!'
        )
    })

    it('shows a server validation error', async () => {
        const user = userEvent.setup()

        mockCreateReport.mockResolvedValue({
            success: false,
            error: 'This Pit Stop is not active',
        })

        render(
            <QueueReportForm
                pitStops={pitStops}
                selectedPitStopId="ps1"
                onSelectedPitStopChange={vi.fn()}
            />
        )

        await user.click(
            screen.getByRole('button', { name: 'Submit Report' })
        )

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'This Pit Stop is not active'
        )
    })

    it('prevents submission without a selected Pit Stop', () => {
        render(
            <QueueReportForm
                pitStops={[]}
                selectedPitStopId=""
                onSelectedPitStopChange={vi.fn()}
            />
        )

        expect(
            screen.getByRole('button', { name: 'Submit Report' })
        ).toBeDisabled()

        expect(mockCreateReport).not.toHaveBeenCalled()
    })
})
