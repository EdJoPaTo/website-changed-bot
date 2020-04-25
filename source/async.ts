/* eslint no-await-in-loop: off */

export async function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

export async function runSequentiallyWithDelayInBetween<Argument>(runner: (job: Argument) => Promise<void>, jobs: readonly Argument[], delayMs: number): Promise<void> {
	let hasRunOnce = false

	for (const job of jobs) {
		if (hasRunOnce) {
			await sleep(delayMs)
		} else {
			hasRunOnce = true
		}

		await runner(job)
	}
}

/**
 * Runs the Runner in an endless loop. If it finishes faster than `minimumDelayBetweenStarts` wait before running again
 */
export function generateEndlessLoopRunner(runner: () => Promise<void>, minimumDelayBetweenStarts: number): () => Promise<void> {
	let startTime: number
	return async () => {
		// eslint-disable-next-line no-constant-condition
		while (true) {
			startTime = Date.now()

			await runner()

			const now = Date.now()
			const waittime = (startTime + minimumDelayBetweenStarts) - now
			if (waittime > 0) {
				await sleep(waittime)
			}
		}
	}
}
