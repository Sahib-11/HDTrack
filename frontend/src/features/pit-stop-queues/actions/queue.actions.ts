'use server'

import { z } from 'zod'
import { Timestamp } from 'firebase-admin/firestore'
import { requireAuth } from '@/actions/auth.actions'
import { adminDb } from '@/lib/firebase/admin'
import type { ActionResult } from '@/types'

// Only accept a valid Pit Stop ID and one of three queue levels
const createQueueReportSchema = z
    .object({
        pitStopId: z
            .string()
            .trim()
            .min(1)
            .max(80)
            .regex(/^[A-Za-z0-9_-]+$/),
        level: z.enum(['short', 'moderate', 'long']),
    })
    .strict()

export async function createQueueReport(
    input: unknown
): Promise<ActionResult<string>> {
    // 1. Make sure the user is signed in
    const session = await requireAuth()

    // 2. Check that the submitted input is valid
    const parsed = createQueueReportSchema.safeParse(input)

    if (!parsed.success) {
        return {
            success: false,
            error: 'Invalid Pit Stop or queue level',
        }
    }

    try {
        // 3. Find the selected Pit Stop in Firestore
        const pitStop = await adminDb
            .collection('pitStops')
            .doc(parsed.data.pitStopId)
            .get()

        // 4. Reject Pit Stops that do not exist
        if (!pitStop.exists) {
            return {
                success: false,
                error: 'Pit Stop not found',
            }
        }

        // 5. Reject locations that are currently inactive
        if (pitStop.data()?.isActive !== true) {
            return {
                success: false,
                error: 'This Pit Stop is not active',
            }
        }

        // 6. Save the validated queue report
        const report = await adminDb.collection('queueReports').add({
            pitStopId: parsed.data.pitStopId,
            uid: session.uid,
            level: parsed.data.level,
            createdAt: Timestamp.now(),
            _schemaVersion: 1,
        })

        // 7. Return the newly created document ID
        return {
            success: true,
            data: report.id,
        }
    } catch (error) {
        console.error('Failed to create queue report:', error)

        return {
            success: false,
            error: 'Unable to save queue report',
        }
    }
}
