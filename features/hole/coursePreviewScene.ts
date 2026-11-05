import { IcosahedronGeometry, Mesh, MeshBasicMaterial } from "three";
import { gsap, MOTION_OK } from "@/lib/motion";
import type { SceneSetup } from "@/lib/three";

const setup: SceneSetup = ({ scene, camera }) => {
  camera.position.z = 3;

  const ball = new Mesh(
    new IcosahedronGeometry(1, 2),
    new MeshBasicMaterial({ color: 0x4c9f5a, wireframe: true }),
  );
  scene.add(ball);

  gsap.matchMedia().add(MOTION_OK, () => {
    gsap.to(ball.rotation, { y: Math.PI * 2, duration: 16, ease: "none", repeat: -1 });
  });
};

export default setup;
