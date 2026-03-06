
import Phaser from 'phaser';
import { Background } from '../objects/Background';
import { Platform } from '../objects/Platform';
import { Foreground } from '../objects/Foreground';
import { RoadsideArchitecture } from '../objects/RoadsideArchitecture';
import { MainScene } from '../scenes/MainScene';
import { PROGRESS } from '../../constants';

export type WorldZone = 'DESERT' | 'TRANSITION' | 'CITY' | 'LIBRARY';
/** Visual sub‑zones inside the city – used for Step 5 environment progression. */
export type CitySegment = 'CITY_ENTRANCE' | 'CITY_STREET' | 'CITY_MARKET' | 'CITY_BAYT';

export class EnvironmentManager {
  private scene: MainScene;
  public background!: Background;
  public platform!: Platform;
  public foreground!: Foreground;
  public roadside!: RoadsideArchitecture;

  private currentZone: WorldZone = 'DESERT';
  private cityStartDistance: number = 0;
  private hasTriggeredLibrary: boolean = false;
  /** Current visual segment while in CITY (entrance → streets → market → Bayt). */
  private citySegment: CitySegment = 'CITY_ENTRANCE';

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

  /** Distance in meters into city before library – part of Stage 2 progression (tunable) */
  private readonly LIBRARY_TRIGGER_DISTANCE = 250;
  /** Distance bands inside Stage 2 (city) to drive visual progression. */
  private readonly CITY_ENTRANCE_MAX = 120; // Just inside the gate
  private readonly CITY_STREET_MAX = 260;   // Simple streets
  private readonly CITY_MARKET_MAX = 400;   // Market / dense core (Bayt after this)

  private checkZoneProgression() {
      if (this.currentZone === 'CITY') {
          const distInCity = this.scene.getRunDistance() - this.cityStartDistance;

          // 1) Visual progression – update city segment based on distance bands
          if (distInCity < this.CITY_ENTRANCE_MAX) {
              this.citySegment = 'CITY_ENTRANCE';
          } else if (distInCity < this.CITY_STREET_MAX) {
              this.citySegment = 'CITY_STREET';
          } else if (distInCity < this.CITY_MARKET_MAX) {
              this.citySegment = 'CITY_MARKET';
          } else {
              // Final stretch – approaching Bayt Al‑Hikma
              this.citySegment = 'CITY_BAYT';
          }

          // 2) Library trigger (Bayt Al‑Hikma entry) – only mark done when discovery actually runs
          if (!this.hasTriggeredLibrary && distInCity >= this.LIBRARY_TRIGGER_DISTANCE) {
              if (this.scene.eventManager.triggerLibraryDiscovery()) {
                  this.hasTriggeredLibrary = true;
              }
          }
      }
  }

  /** Call when magic carpet ride ends: if we already passed the library entrance, trigger it immediately so the event unfolds. */
  public triggerLibraryIfPastEntrance(): boolean {
      if (this.currentZone !== 'CITY') return false;
      const distInCity = this.scene.getRunDistance() - this.cityStartDistance;
      if (this.hasTriggeredLibrary || distInCity < this.LIBRARY_TRIGGER_DISTANCE) return false;
      if (this.scene.eventManager.triggerLibraryDiscovery()) {
          this.hasTriggeredLibrary = true;
          return true;
      }
      return false;
  }

  public transitionToCity() {
      if (this.currentZone !== 'DESERT') return;
      
      this.currentZone = 'TRANSITION';
      this.cityStartDistance = this.scene.getRunDistance(); // Mark entry point
      this.citySegment = 'CITY_ENTRANCE';
      
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

  /** Returns current city visual segment (entrance / streets / market / Bayt). */
  public getCitySegment(): CitySegment {
      return this.citySegment;
  }
}
