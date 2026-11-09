export {};

type JobStatus = "en_cola" | "renderizando" | "terminado";

interface RenderJob {
    scene: string;
    frames: number;
    minutesPerFrame: number;
    status: JobStatus;
}

class RenderFarm<T extends RenderJob> {
    constructor(private readonly jobs: T[]) {}

    queue(): T[] {
        return this.jobs.filter((job) => job.status === "en_cola");
    }

    estimateMinutes(job: T): number {
        return job.frames * job.minutesPerFrame;
    }
}

const jobs: RenderJob[] = [
    { scene: "Amanecer", frames: 240, minutesPerFrame: 3, status: "renderizando" },
    { scene: "Persecucion", frames: 180, minutesPerFrame: 5, status: "en_cola" },
    { scene: "Creditos", frames: 90, minutesPerFrame: 1, status: "en_cola" },
];

const farm = new RenderFarm(jobs);
farm.queue().forEach((job) => {
    console.log(`${job.scene}: ${job.frames} frames, estimado ${farm.estimateMinutes(job)} min`);
});
console.log(`Trabajos esperando: ${farm.queue().length}`);
