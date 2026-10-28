'use client'

import { useMemo, useState } from 'react'
import { useCollection } from '@/hooks/useFirestore'
import { getPitStopsCollection } from '@/lib/firebase/firestore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { QueueReportForm } from './QueueReportForm'
import { QueueReportsList } from './QueueReportsList'

export function PitStopQueuesPanel() {
    const [requestedPitStopId, setRequestedPitStopId] = useState('')

    // Use a stable Firestore collection reference
    const pitStopsCollection = useMemo(
        () => getPitStopsCollection(),
        []
    )

    const {
        data: pitStops,
        loading,
        error,
    } = useCollection(pitStopsCollection)

    if (loading) {
        return (
            <div className="flex items-center gap-3 py-8">
                <LoadingSpinner />
                <span className="text-sm text-zinc-500">
                    Loading Pit Stops...
                </span>
            </div>
        )
    }

    if (error) {
        return (
            <p role="alert" className="text-sm text-red-600">
                Unable to load Pit Stops: {error.message}
            </p>
        )
    }

    // Only active Pit Stops can receive new reports
    const activePitStops = pitStops.filter(
        (stop) => stop.isActive === true
    )

    const firstActivePitStop = activePitStops[0]

    if (!firstActivePitStop) {
        return (
            <EmptyState
                title="No active Pit Stops"
                description="There are currently no Pit Stops available for queue reporting."
            />
        )
    }

    // Default to the first active Pit Stop
    const selectedPitStopId = activePitStops.some(
        (stop) => stop.id === requestedPitStopId
    )
        ? requestedPitStopId
        : firstActivePitStop.id

    return (
        <div className="space-y-8">
            <QueueReportForm
                pitStops={activePitStops}
                selectedPitStopId={selectedPitStopId}
                onSelectedPitStopChange={setRequestedPitStopId}
            />

            <section className="space-y-1">
                <h2 className="text-xl font-semibold">
                    Recent Queue Reports
                </h2>

                <p className="text-sm text-zinc-500">
                    View recent reports submitted by fans for the selected Pit Stop.
                </p>
                <br />
                <QueueReportsList
                    key={selectedPitStopId}
                    pitStopId={selectedPitStopId}
                />
            </section>
        </div>
    )
}
