
import type { Metadata } from 'next'
import { requireAuth } from '@/actions/auth.actions'
import { PageHeader } from '@/components/layout/PageHeader'
import { PitStopQueuesPanel } from '@/features/pit-stop-queues/components/PitStopQueuesPanel'

export const metadata: Metadata = {
    title: 'Pit Stop Queue Reports',
}

export default async function PitStopQueuesPage() {
    await requireAuth()

    return (
        <div className="space-y-6">
            <PageHeader
                title="Pit Stop Queue Reporter"
                description="Report queue levels and view recent fan submissions."
            />

            <PitStopQueuesPanel />
        </div>
    )
}
