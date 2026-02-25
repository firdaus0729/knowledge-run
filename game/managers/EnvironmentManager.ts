
import Phaser from 'phaser';
import { Background } from '../objects/Background';
import { Platform } from '../objects/Platform';
import { Foreground } from '../objects/Foreground';
import { RoadsideArchitecture } from '../objects/RoadsideArchitecture';
import { MainScene } from '../scenes/MainScene';

export type WorldZone = 'DESERT' | 'TRANSITION' | 'CITY' | 'LIBRARY';

export class EnvironmentManager {
  private scene: MainScene;
  public background!: Background;
  public platform!: Platform;
  public foreground!: Foreground;
  public roadside!: RoadsideArchitecture;

  private currentZone: WorldZone = 'DESERT';
  private cityStartDistance: number = 0;
  private hasTriggeredLibrary: boolean = false;

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  public create() {
    this.background = new Background(this.scene);
    this.platform = new Platform(this.scene);
    this.roadside = new RoadsideArchitecture(this.scene); 
    this.foreground = new Foreground(this.scene);
  }

  public update(time: number, delta: number, speed: number) {
    if (this.background) this.background.update(time, delta, speed);
    if (this.platform) this.platform.update(speed);
    if (this.roadside) this.roadside.update(delta, speed);
    if (this.foreground) this.foreground.update(delta, speed);

    this.checkZoneProgression();
  }

  /** Distance into city before library event (player must feel deeper in the city) */
  private readonly LIBRARY_TRIGGER_DISTANCE = 1400;

  private checkZoneProgression() {
      if (this.currentZone === 'CITY' && !this.hasTriggeredLibrary) {
          const distInCity = this.scene.getRunDistance() - this.cityStartDistance;
          if (distInCity >= this.LIBRARY_TRIGGER_DISTANCE) {
              this.hasTriggeredLibrary = true;
              this.scene.eventManager.triggerLibraryDiscovery();
          }
      }
  }

  public transitionToCity() {
      if (this.currentZone !== 'DESERT') return;
      
      this.currentZone = 'TRANSITION';
      this.cityStartDistance = this.scene.getRunDistance(); // Mark entry point
      
      // 1. Fade Background
      this.background.transitionToCity(4000);

      // 2. Change Ground Texture
      this.platform.transitionTexture('ground_city');

      // 3. Update Zone State after visual transition
      this.scene.time.delayedCall(4000, () => {
          this.currentZone = 'CITY';
      });
  }

  public transitionToLibrary() {
      if (this.currentZone === 'LIBRARY') return;
      
      this.currentZone = 'LIBRARY';

      // 1. Visual Transition (Background Shelves)
      this.background.transitionToLibrary(100); 
      
      // 2. Change Ground Texture to polished Library floor
      this.platform.transitionTexture('ground_library');
  }

  public transitionLibraryToCity() {
      // Called during Carpet Ride
      // We are flying, so ground is not visible or far away. Perfect time to swap.
      this.platform.transitionTexture('ground_city');
      
      // Fade background from Library back to City
      this.background.transitionLibraryToCity(3000);
  }

  public finalizeCityTransition() {
      this.currentZone = 'CITY';
      // Reset flags for loop if needed, or advance stage
  }

  public resize(width: number, height: number) {
    if (this.background) this.background.resize(width, height);
    if (this.platform) this.platform.resize(width, height);
    if (this.roadside) this.roadside.resize(width, height);
    if (this.foreground) this.foreground.resize(width, height);
  }

  public getPlatform(): Platform {
      return this.platform;
  }
  
  public getZone(): WorldZone {
      return this.currentZone;
  }
}
