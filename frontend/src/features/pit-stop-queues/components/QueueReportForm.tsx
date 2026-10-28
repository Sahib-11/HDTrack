'use client'

import { useState, SubmitEvent } from 'react'
import { createQueueReport } from '@/features/pit-stop-queues/actions/queue.actions'
import type { PitStop, QueueLevel } from '@/types/firestore'

interface QueueReportFormProps {
    pitStops: PitStop[]
    selectedPitStopId: string
    onSelectedPitStopChange: (id: string) => void
}

const queueLevels: { value: QueueLevel; label: string }[] = [
    { value: 'short', label: 'Short queue' },
    { value: 'moderate', label: 'Moderate queue' },
    { value: 'long', label: 'Long queue' },
]

export function QueueReportForm({
    pitStops,
    selectedPitStopId,
    onSelectedPitStopChange,
}: QueueReportFormProps) {
    const [level, setLevel] = useState<QueueLevel>('short')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [status, setStatus] = useState<{
        type: 'success' | 'error'
        message: string
    } | null>(null)

    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        setStatus(null)

        if (!selectedPitStopId) {
            setStatus({
                type: 'error',
                message: 'Please select a Pit Stop.',
            })
            return
        }

        setIsSubmitting(true)

        try {
            const result = await createQueueReport({
                pitStopId: selectedPitStopId,
                level,
            })

            if (result.success) {
                setStatus({
                    type: 'success',
                    message: 'Queue report submitted successfully!',
                })
            } else {
                setStatus({
                    type: 'error',
                    message: result.error ?? 'Failed to submit report.',
                })
            }
        } catch {
            setStatus({
                type: 'error',
                message: 'Something went wrong. Please try again.',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
            <h2 className="text-lg font-semibold">Submit a Queue Report</h2>

            <div className="space-y-2">
                <label
                    htmlFor="pit-stop"
                    className="block text-sm font-medium"
                >
                    Select Pit Stop
                </label>

                <select
                    id="pit-stop"
                    value={selectedPitStopId}
                    onChange={(event) => {
                        onSelectedPitStopChange(event.target.value)
                        setStatus(null)
                    }}
                    required
                    disabled={isSubmitting || pitStops.length === 0}
                    className="w-full rounded-md border border-zinc-300 bg-white p-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                    <option value="" disabled>
                        Select a Pit Stop
                    </option>

                    {pitStops.map((stop) => (
                        <option key={stop.id} value={stop.id}>
                            {stop.name} — {stop.location}
                        </option>
                    ))}
                </select>
            </div>

            <br />
            <fieldset className="space-y-3">
                <legend className="text-sm font-medium">
                    How busy is the queue?
                </legend>

                {queueLevels.map((option) => (
                    <label
                        key={option.value}
                        className="flex cursor-pointer items-center gap-3 rounded-md border border-zinc-200 p-3 dark:border-zinc-700"
                    >
                        <input
                            type="radio"
                            name="queue-level"
                            value={option.value}
                            checked={level === option.value}
                            onChange={() => {
                                setLevel(option.value)
                                setStatus(null)
                            }}
                            disabled={isSubmitting}
                            className="h-4 w-4"
                        />
                        <span className="text-sm">{option.label}</span>
                    </label>
                ))}
            </fieldset>

            <br />
            <button
                type="submit"
                disabled={isSubmitting || !selectedPitStopId}
                className="w-full rounded-md bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>

            {
                status && (
                    <p
                        role={status.type === 'error' ? 'alert' : 'status'}
                        className={
                            status.type === 'success'
                                ? 'text-sm text-green-700 dark:text-green-400'
                                : 'text-sm text-red-600 dark:text-red-400'
                        }
                    >
                        {status.message}
                    </p>
                )
            }
        </form >
    )
}
