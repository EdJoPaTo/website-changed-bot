export async function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

export async function runSequentiallyWithDelayInBetween<Argument>(runner: (job: Argument) => Promise<void>, jobs: readonly Argument[], delayMs: number): Promise<void> {
	let hasRunOnce = false

	for (const job of jobs) {
		/* eslint-disable no-await-in-loop */
		if (hasRunOnce) {
			await sleep(delayMs)
		} else {
			hasRunOnce = true
		}

		await runner(job)
		/* eslint-enable */
	}
}
