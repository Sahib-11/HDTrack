'use client'

import { useMemo } from 'react'
import { where } from 'firebase/firestore'
import { useCollection } from '@/hooks/useFirestore'
import { getQueueReportsCollection } from '@/lib/firebase/firestore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'

interface QueueReportsListProps {
    pitStopId: string
}

export function QueueReportsList({
    pitStopId,
}: QueueReportsListProps) {
    // Keep the Firestore collection reference stable
    const reportsCollection = useMemo(
        () => getQueueReportsCollection(),
        []
    )

    // Subscribe to reports for this Pit Stop
    const {
        data: reports,
        loading,
        error,
    } = useCollection(
        reportsCollection,
        where('pitStopId', '==', pitStopId)
    )

    if (loading) {
        return (
            <div className="flex items-center gap-3 py-8">
                <LoadingSpinner />
                <span className="text-sm text-zinc-500">
                    Loading queue reports...
                </span>
            </div>
        )
    }

    if (error) {
        return (
            <p role="alert" className="text-sm text-red-600">
                Unable to load queue reports: {error.message}
            </p>
        )
    }

    if (reports.length === 0) {
        return (
            <EmptyState
                title="No queue reports yet"
                description="Be the first to report the queue at this Pit Stop."
            />
        )
    }

    // Sort newest reports first, without modifying React state
    const sortedReports = [...reports].sort(
        (a, b) =>
            (b.createdAt?.toMillis() ?? 0) -
            (a.createdAt?.toMillis() ?? 0)
    )

    return (
        <ul className="space-y-3">
            {sortedReports.slice(0, 10).map((report) => (
                <li
                    key={report.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                    <div>
                        <p className="font-medium capitalize">
                            {report.level} queue
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                            Fan-submitted queue report
                        </p>
                    </div>

                    <time className="text-xs text-zinc-500">
                        {report.createdAt?.toDate()
                            ? report.createdAt.toDate().toLocaleString()
                            : 'Just now'}
                    </time>
                </li>
            ))}
        </ul>
    )
}
