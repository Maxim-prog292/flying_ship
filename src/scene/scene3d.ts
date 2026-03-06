import * as THREE from 'three';
import type { ScreenState } from '../app/types';

export class FlyingScene {
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(55, 16 / 9, 0.1, 100);
  private readonly renderer: THREE.WebGLRenderer;
  private readonly ship: THREE.Mesh;

  constructor(private readonly container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.container.append(this.renderer.domElement);

    this.camera.position.set(0, 1.4, 4.5);

    const ambientLight = new THREE.AmbientLight(0xb0d4ff, 0.8);
    const directional = new THREE.DirectionalLight(0x8dc4ff, 1.2);
    directional.position.set(4, 6, 3);

    const geometry = new THREE.ConeGeometry(0.7, 2.2, 12);
    const material = new THREE.MeshStandardMaterial({ color: 0x4f97ff, metalness: 0.2, roughness: 0.35 });
    this.ship = new THREE.Mesh(geometry, material);
    this.ship.rotation.z = Math.PI;

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.08, 16, 48),
      new THREE.MeshBasicMaterial({ color: 0x8ec5ff })
    );
    halo.rotation.x = Math.PI / 2;

    this.scene.add(ambientLight, directional, this.ship, halo);

    window.addEventListener('resize', this.onResize);
  }

  public render(state: ScreenState): void {
    const time = performance.now() * 0.001;
    this.ship.rotation.y = time * 0.9;
    this.ship.position.y = Math.sin(time * 1.5) * 0.15;

    switch (state) {
      case 'attract':
        this.ship.scale.setScalar(1);
        break;
      case 'build':
        this.ship.scale.setScalar(1.1);
        break;
      case 'trial':
        this.ship.scale.setScalar(1.25);
        this.ship.rotation.x = Math.sin(time * 4) * 0.15;
        break;
      case 'result':
        this.ship.scale.setScalar(1.05);
        this.ship.rotation.x = 0;
        break;
      case 'auto-reset':
        this.ship.scale.setScalar(0.95);
        this.ship.rotation.x = 0;
        break;
      default:
        break;
    }

    this.renderer.render(this.scene, this.camera);
  }

  public destroy(): void {
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }

  private readonly onResize = (): void => {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };
}
