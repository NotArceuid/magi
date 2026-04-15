import { InvokeableEvent } from "./utils/Events";

export interface GameLoopOptions {
  TickSpeed?: number;
  MaxUpdates?: number;
}

interface DevHacks {
  SpeedHack: number;
  GodMode: boolean;
  InstantKill: boolean;
  FreeUpgrades: boolean;
  SkipLevelUnlock: boolean;
  InfiniteResources: boolean;
}

const DEFAULT_HACKS: DevHacks = {
  SpeedHack: 10,
  GodMode: false,
  InstantKill: false,
  FreeUpgrades: false,
  SkipLevelUnlock: false,
  InfiniteResources: false,
};

type EngineState = 'STOPPED' | 'RUNNING' | 'PAUSED';

export class Engine {
  private options: Required<GameLoopOptions>;
  private state: EngineState = 'STOPPED';
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private accumulator: number = 0;

  public Tick: InvokeableEvent<number> = new InvokeableEvent();
  public Render: InvokeableEvent<number> = new InvokeableEvent();
  public timeScale: number = 1.0;
  public Hacks: DevHacks = { ...DEFAULT_HACKS };
  public fps: number = 0;
  public tps: number = 0;

  private fpsAccumulator: number = 0;
  private fpsFrameCount: number = 0;
  private tpsTickCount: number = 0;

  constructor(options: GameLoopOptions = {}) {
    this.options = {
      TickSpeed: 60,
      MaxUpdates: 5,
      ...options,
    };

    document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));
  }

  private get step(): number {
    return 1000 / this.options.TickSpeed;
  }

  public get TickSpeed(): number {
    return this.options.TickSpeed;
  }
  public set TickSpeed(tps: number) {
    this.options.TickSpeed = Math.max(1, tps);
    this.accumulator = 0;
  }

  public get State(): EngineState {
    return this.state;
  }

  public start(): void {
    if (this.state === 'RUNNING') return;
    this.state = 'RUNNING';
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
  }

  public pause(): void {
    if (this.state !== 'RUNNING') return;
    this.state = 'PAUSED';
    this.cancelFrame();
  }

  public resume(): void {
    if (this.state !== 'PAUSED') return;
    this.state = 'RUNNING';
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
  }

  public stop(): void {
    this.state = 'STOPPED';
    this.cancelFrame();
  }

  private cancelFrame(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private onVisibilityChange(): void {
    if (document.hidden) {
      if (this.state === 'RUNNING') this.pause();
    } else {
      if (this.state === 'PAUSED') this.resume();
    }
  }

  private loop(currentTime: number): void {
    if (this.state !== 'RUNNING') return;

    const frameTime = Math.min(currentTime - this.lastTime, 1000);
    this.lastTime = currentTime;

    const effectiveScale = this.timeScale * this.Hacks.SpeedHack;
    this.accumulator += frameTime * effectiveScale;

    this.fpsAccumulator += frameTime;
    this.fpsFrameCount++;

    const step = this.step;
    let updateCount = 0;

    while (this.accumulator >= step && updateCount < this.options.MaxUpdates) {
      this.nextTick(step);
      this.accumulator -= step;
      updateCount++;
      this.tpsTickCount++;
    }

    if (this.fpsAccumulator >= 1000) {
      this.fps = Math.round(this.fpsFrameCount * (1000 / this.fpsAccumulator));
      this.tps = Math.round(this.tpsTickCount * (1000 / this.fpsAccumulator));
      this.fpsFrameCount = 0;
      this.tpsTickCount = 0;
      this.fpsAccumulator = 0;
    }

    const interpolation = this.accumulator / step;
    this.render(interpolation);

    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
  }

  private nextTick(delta: number): void {
    this.Tick.invoke(delta);
  }

  private render(interpolation: number): void {
    this.Render.invoke(interpolation);
  }
}
